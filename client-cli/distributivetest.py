# import keras
from __future__ import absolute_import, division, print_function, unicode_literals
import matplotlib.pyplot as plt


import numpy as np
from tensorflow import keras

import tensorflow as tf

# print(tf.__version__)

class Network:


    def __init__(model, training, time):
        self.model = model
        self.training = training
        self.time = time


        fashion_mnist = keras.datasets.fashion_mnist

        (train_images, train_labels), (test_images, test_labels) = fashion_mnist.load_data()

        class_names = ['T-shirt/top', 'Trouser', 'Pullover', 'Dress', 'Coat',
        'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle boot']


        plt.figure()
        plt.imshow(train_images[0])
        plt.colorbar()
        plt.grid(False)
        plt.show()


        model = keras.Sequential([
            keras.layers.Flatten(input_shape=(28, 28)),
            keras.layers.Dense(128, activation=tf.nn.relu),
            keras.layers.Dense(10, activation=tf.nn.softmax)
        ])

        model.compile(optimizer ='adam', loss = 'sparse_categorical_crossentropy', metrics = ['accuracy'])

        model.fit(train_images, train_labels)


        test_loss, test_acc  = model.evaluate(test_images, test_labels)

        print(test_acc)


        f = open('hi.txt')

    # def graph(i, test_value, true_value):
