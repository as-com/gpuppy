from textgenrnn import textgenrnn

textgen = textgenrnn()
textgen.train_from_file('datasets/reddit_apple_android_2000.txt', num_epochs=2, new_model=True, batch_size=1024)
textgen.generate()

