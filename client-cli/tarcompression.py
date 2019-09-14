# import tarfile
# # # # import distributivetest
import os
import tempfile

import subprocess
import tempfile


print("hello world")


with tempfile.TemporaryFile() as tempf:
    proc = subprocess.Popen(['echo', 'a', 'b'], stdout=tempf)
    proc.wait()
    tempf.seek(0)
    print(tempf.read())
# # #
# # # # source_dir = "."
# # #
# # #
# def make_tarfile(output_filename, source_dir):
#     with tarfile.open(output_filename, "x:gz", fileobj = "distributivetest.py") as tar:
#         tar.add(".", arcname = os.path.basename(source_dir))

#
# if __name__ == "__main__":
#     make_tarfile("distrib.tar.gz", ".")
# # import os
# # os.system('ls -l')
#

tempfile.TemporaryFile
import os
os.system("tar -zcvf archive-name.tar.gz directory-name ")
# import tarfile
#
# f = tarfile.open("testingMITTTTTT.tar.gz", "w:gz")
#
# f.add(".", arcname = os.path.basename("."))
# f.close()

#
# import click
#
# def main():
#     click.echo("This is a CLI built with Click")
#
# if __name__ == "__main__":
#     main()
# import argparse
# parser = argparse.ArgumentParser(description='Add some integers.')
# parser.add_argument('integers', metavar='N', type=int, nargs='+',
#                     help='interger list')
# parser.add_argument('--sum', action='store_const',
#                     const=sum, default=max,
#                     help='sum the integers (default: find the max)')
# args = parser.parse_args()
# print(args.sum(args.integers))
