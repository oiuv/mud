                           LPC Basics
                  Written by Descartes of Borg
                  first edition: 23 april 1993
                  second edition: 25 may 1993

CHAPTER 1: Introduction to the Coding Environment

1.1 UNIX file structure
LPMuds use basic UNIX commands and its file structure.  If you know
UNIX commands already, then note (with a few exceptions) options are
not available to the commands.  Like DOS, UNIX is heirarchical.  The
root directory of which all directories are sub-directories is called
root(/).  And from those sub-directories you may have further
sub-directories.  A directory may be referred to in two different ways:
1) by its full name, or absolute name, or 2) by its relative name.
Absolute name refers to the directory's full path starting from / winding
down the directory tree until you name the directory in question.  For
example:

    /players/descartes/obj/monster

refers to the directory monster which is a sub-directory of obj which
is a sub-directory of descartes which is a sub-directory of players
which is a sudirectory of /.

The relative name refers to the name relative to another directory.
The above example is called monster relative to /players/descartes/obj,
but it is also called obj/monster relative to /players/descartes,
descartes/obj/monster relative to /players, and finally
players/descartes/obj/monster relative to /.  You can tell the
difference between absolute names and relative names because absolute
names always start with /.  In order to know exactly which directory
is being named by a relative name, you naturally must know what
directory it is relative to.

A directory contains sub-directories and files.  LPMuds only use text files
inside the mudlib.  Like directories, files have both absolute and
relative names.  The most basic relative name is often referred to as the file
name, with the rest of the absolute name being referred to as the path.  So,
for the file: /players/descartes/castle.c, castle.c is the file name, and
/players/descartes is the path.

On some muds, a file with a file name beginning with a . (like .plan) is
not visible when you list files with the regular file listing command.

1.2 UNIX Commands
Along with the UNIX file structure, LPMuds use many UNIX commands.  Typical
UNIX commands on most muds are:
pwd, cd, ls, rm, mv, cp, mkdir, rmdir, more, head, cat, ed
If you have never before seen UNIX commands, you probably are thinking this
is all nonsense.  Well, it is, but you got to use them.  Before getting
into what they mean though, first a discussion of current directory.
If you know DOS, then you know what a current working directory is.
At any given point, you are considered to be "in" some directory.  This
means that any relative file or directory names you give in UNIX commands
are relative to that directory.  For example, if my current directory is
/players/descartes and I type "ed castle.c" (ed is the command to edit),
then it assumes I mean the file /players/descartes/castle.c

pwd: shows you your current working directory
cd: changes your current working directory.  You may give either relative
    or absolute path names.  With no arguments, it changes to your home
    directory.
ls: lists all files in the directory named.  If no directory is named,
    it lists the files of the current working directory
rm: deletes the file named
mv: renames the file named
cp: copies the file named
mkdir: makes a new directory
rmdir: deletes a directory.  All files must have been first removed.
more: pages the file named so that the file appears on your screen one
    page at a time.
cat: shows the whole file to you at once
head: shows you the first several lines of a file
tail: shows you the last several lines of a file
ed: allows you to edit a file using the mud editor

1.3 Chapter Summary
UNIX uses a heirarchical file structure with the root of the tree being
named /.  Other directories branch off from that root directory and
in turn have their own sub-directories.  All directories may contain
directories and files.  Directories and files are referred to either
by their absolute name, which always begins with /, or by their relative
name which gives the file's name relative to a particular directory.
In order to get around in the UNIX files structure, you have the
typical UNIX commands for listing files, your current directory, etc.
On your mud, all of the above commands should have detailed help commands
to help you explore exactly what they do.  In addition, there should
be a very detailed file on your mud's editor.  If you are unfamiliar
with ed, you should go over this convoluted file.
