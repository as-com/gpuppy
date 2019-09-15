from __future__ import print_function
import copy
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import sys

def acoli_hist(initpos, foodfn, rttp, ttrp, ntrials, nsteps, nbins, visualize=False):
    """
    ACOLI_HIST Computes histograms for A. Coli 
      [HISTM, FOOD] =
        acoli_hist(INITPOS, FOODFN, RTTP, TTRP, NTRIALS, NSTEPS, NBINS, VIZ)
    
    Computes the number of times a bacterium enters a region. The regions
    are defined as rectangular bins which cover the space in a regular
    grid. The experiment consists of several trials (ntrials) during each
    of which the bacterium is allowed to move for several steps.
    
    Behavior: The bacterium either performs a run (advancing two units in
    the current direction) or a tumble (rotating the current direction by a
    random angle between 20 and 90 degrees and advancing one unit).
    Switching between the two modes is controlled by the two probabilities
    RTTP and TTRP. In addition, if the bacterium senses that it has moved
    in the direction of increasing food concentration, then the random
    angle during a tumble is between 10 and 45 degrees, i.e. the bacterium
    does not turn much if it goes toward food.
    
    -- Input Arguments --

    INITPOS is the initial position of the bacterium as a 2 element vector
    [X Y]. The allowable range for both coordinates is [-2, 2]. To start
    the bacterium in the center of the food function, use [0, 0].

    FOODFN selects the food function. This can be either 1 or 2.

    RTTP is the probability of transitioning from the run state to the
    tumble state.

    TTRP is the probability of transitioning from a tumble ot a run.

    NTRIALS is the number of separate trials to run (starting the bacterium
    from INITPOS each trial).

    NSTEPS is the number of times to let the bacterium update its
    behavior during each trial (i.e., the number of times to perform either
    a run or a tumble).

    NBINS are the number of bins to use in each direction for the
    histogram. (The histogram covers the same area, so using more bins
    increases the resolution of the histogram.)

    VIZ is a flag controlling whether or not to open a figure window
    displaying movements of the bacterium during a trial. This is optional
    and defaults to false. Remember that you can use CTRL+C at any time to
    abort a long running MATLAB operation, in case NTRIALS and/or
    RUNSPERTRIAL are large. This display slows down the simulation
    considerably, so don't use it if you only need the histogram.
    
    -- Output Variables --
    
    HISTM is the matrix of bins containing the number of times a bacterium
    has passed through the corresponding region, i.e., the histogram
    matrix. Each element contains the total number of times the bacterium
    has passed through that bin over all trials. The matrix covers a 4x4
    square (these are the same arbitrary units as passed to INITPOS),
    centered at the origin.

    FOOD is the matrix containing the concentration of food, i.e., the food
    function. It covers the same area as the histogram matrix.
    """



    try:
        assert len(initpos) == 2 and max(np.abs(initpos)) <= 2
    except:
        raise ValueError('Argument initpos outside permitted range.')

    RUN = 0
    TUMBLE = 1


    recordhist = 1;
    sp = 0.1;
    xmin = -2; xmax = 2;
    ymin = -2; ymax = 2;
    [xs, ys] = np.meshgrid(np.arange(xmin,xmax+sp,sp), np.arange(ymin,ymax+sp,sp));

    xbins = nbins;
    ybins = nbins;

    xlocs = np.linspace(xmin, xmax, xbins);
    ylocs = np.linspace(ymin, ymax, ybins);

    xstp = (xmax - xmin)/float(len(xlocs));
    ystp = (ymax - ymin)/float(len(ylocs));

    histm = np.zeros((xbins, ybins));

    food_peaks = np.array([[1., 1.],[-0.4, -0.4]])
    if foodfn == 1:
        food_func = lambda x,y: np.exp(-.7*(np.square(x - food_peaks[0,0]) + np.square(y - food_peaks[0,1])))
    elif foodfn == 2:
        food_func = lambda x,y: 2*np.exp(-.7*(np.square(x - food_peaks[0,0]) + np.square(y - food_peaks[0,1]))) + \
            np.exp(-5*(np.square(x - food_peaks[1,0])+ np.square(y - food_peaks[1,1])))
    else:
        raise ValueError('foodfn must be either 1 or 2.') 
        
    
    xx, yy = np.meshgrid(np.linspace(xmin, xmax, xbins), np.linspace(ymin, ymax, ybins));
    food = food_func(xx, yy);

    dt = sp


    def update_bacterium(acoli, dt):
        def rotatevec(v,a):
            rotM = np.array([[np.cos(a), np.sin(a)],[-np.sin(a), np.cos(a)]])
            return np.dot(rotM,v).T

        # Compute concentration gradient
        fgrad = food_func(*acoli['pos']) - food_func(*acoli['oldpos'])
        
        newacoli = copy.deepcopy(acoli)
        
        rotupgrad = 1; # Scale factor for tumble rotation

        if fgrad > 0: #if food has increased
            rotupgrad = .5
        
        if acoli['mode'] == RUN: # Run
            vec = acoli['vec']/np.linalg.norm(acoli['vec']);
            newvec = 2*vec; #Two units, same direction

            if rttp > np.random.random():
                newacoli['mode'] = TUMBLE # Change to tumble mode
          
        elif acoli['mode'] == TUMBLE: # Tumble
            vec = acoli['vec']/np.linalg.norm(acoli['vec']); # old direction
            rnum = np.random.random();
            angle = ((1 - rnum)*20 + rnum*90)*rotupgrad*np.pi/180;
            newvec = rotatevec(vec, angle); # One unit, new direction

            if ttrp > np.random.random():
                newacoli['mode'] = RUN # Change to run mode

        
        newpos = acoli['pos'] + dt*newvec; # Move
        
        newacoli['oldpos'] = acoli['pos']
        newacoli['pos'] = list(newpos)
        newacoli['vec'] = list(newvec)
        #newacoli['fgrad'] = fgrad
        
        if recordhist:
            newacoli['hist'].append(newacoli['pos']+newacoli['vec'])

        return newacoli

    if visualize:
        
        nframes = (nsteps+1)

        fig = plt.figure()

        plt.contour(xs, ys, food_func(xs, ys),20)#,origin='image')
        plt.plot([food_peaks[0][1]], [food_peaks[0][1]], '*r');
        # Draw initial location
        plt.plot([initpos[0]], [initpos[1]], '*k');
        redDot, = plt.plot([], [], 'ro')
        trajectory, = plt.plot([], [], ':k',linewidth=2)
        arrow, = plt.plot([], [])
        run_no = plt.text(-2,2.1,'')
        plt.axis('equal')
        plt.axis('tight') 

        x_pos_hist = {}
        y_pos_hist = {}
        vec_hist = {}

        def animate(i):

            runi = i//nframes
            stepi = i%nframes

            redDot.set_data(x_pos_hist[runi][stepi], y_pos_hist[runi][stepi])
            trajectory.set_data(x_pos_hist[runi][:stepi+1], y_pos_hist[runi][:stepi+1])
            arrow.set_data([x_pos_hist[runi][stepi],x_pos_hist[runi][stepi]+vec_hist[runi][stepi,0]], [y_pos_hist[runi][stepi],y_pos_hist[runi][stepi]+vec_hist[runi][stepi,1]])
            run_no.set_text('Run #{}'.format(runi+1))

            return redDot,trajectory,arrow    


    print('Trial:',end=' ')
    for runi in range(ntrials):
        print(runi,end=' ')
        sys.stdout.flush()
        acoli = dict()
        acoli['pos'] = list(initpos);
        acoli['oldpos'] = acoli['pos'];
        acoli['vec'] = [np.random.random() - 0.5, np.random.random() - 0.5];
        #acoli['fgrad'] = 0;
        acoli['mode'] = RUN
        acoli['hist'] = [acoli['pos']+acoli['vec']]

        for i in range(nsteps):
            acoli = update_bacterium(acoli, dt)
            px, py = acoli['pos']
            if px >= xmin and px <= xmax and py >= ymin and py <= ymax:
                ptj = int(np.floor((px - xmin)/xstp))
                pti = int(np.floor((py - ymin)/ystp))
                histm[pti, ptj] += 1;
        

        if visualize:

            x_pos_hist[runi] = [acoli['hist'][ii][0] for ii in range(nframes)]
            y_pos_hist[runi] = [acoli['hist'][ii][1] for ii in range(len(acoli['hist']))]
            u_hist = [acoli['hist'][ii][2] for ii in range(len(acoli['hist']))]
            v_hist = [acoli['hist'][ii][3] for ii in range(len(acoli['hist']))]
            vec_hist[runi] = np.stack([u_hist,v_hist],1)
            vec_hist[runi] = .2*vec_hist[runi]/np.linalg.norm(vec_hist[runi],axis=1,keepdims=1)

    if visualize:
        ani = FuncAnimation(fig, animate, frames=nframes*ntrials, interval=100, repeat=False)
        plt.show()
        
    return histm, food

