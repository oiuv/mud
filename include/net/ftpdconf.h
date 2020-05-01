/* ftpdconf.h: ftpd configuration */

#ifndef _FTPDCONF_H
#define _FTPDCONF_H

// The following defines are in <globals.h> which is included automatically.
// #include <uid.h>        /* gets define for ROOT_UID on tmi-2 */
// #include <config.h>

#include <mudlib.h> /* gets mud info define from The.Master.Of.Hero */
#include <net/socket.h> /* various socket defines from tmi-2 */

/*
-----------------------------------------------
   standard defines.
-----------------------------------------------
*/

/* FTPD_PORT port number on which the ftp daemon will listen.  On a UNIX
   system the user should type: ftp tmi.lp.mud.org 5554
   (depending on the hostname of the MUD and the port # set below).
*/
#define FTPD_PORT (__PORT__ + 21)

/* time in seconds that an ftp connection should be idle before it times out;
 * this is used as the default for all connections--see MAX_FTPD_IDLE
 */
#define FTPD_TIMEOUT 900

/* this is the maximum idle value that can be set with the SITE IDLE command;
 * note that when a user logs into ftp, they are assigned the value in
 * FTPD_TIMEOUT and may manually adjust it up to the limit of MAX_FTPD_IDLE
 */
#define MAX_FTPD_IDLE 7200

/* HOME_DIR: given a username give the home directory path */
#define HOME_DIR(name)  user_cwd(name) /* on TMI-2 */

/* If this is defined, it should point to a file that should be
 * displayed upon every successful login.
 */
#define LOGIN_MSG       "/adm/etc/ftpd_welcome"

/* the name of the MUD */
#define THE_MUD_NAME    INTERMUD_MUD_NAME

/* Maximum number of simultaneous ftp users. */
#define FTPD_MAX_USERS 8

/* the version # of the driver (__VERSION__ on MudOS muds) */
#define THE_VERSION __VERSION__

/* Set this to be the size of each outgoing block of data during
 * file transfers.  This hasn't been tested with any value other
 * than 1024, so its generally good to leave this alone.
 */
#define BLOCK_SIZE 1152

/* who to send bug reports to */
#define FTP_BUGS_EMAIL "pc-feng@163.com"

/*
-----------------------------------------------
   misc support defines.
-----------------------------------------------
*/

/* define this to allow "anonymous" ftp logins */
#undef ANONYMOUS_FTP


/* define this to allow guest wizards (without home directories) to login */
#undef GUEST_WIZARD_FTP

/* define this to support advisory file locking */
#undef FILE_LOCKING

/* define this to support individual site checking (from .login file) */
#undef CHECK_SITE

/* define this to support .message files sent to user when they "cd" */
#define MESSAGE_FILES

#if 0
/*
 * (copied from ftpd.h)
 * these flags determine read level access (values are intentionally unique...
 * and are manually generated, so don't change them)
 */
#define VALID_READ       0              // rely on valid_read()
#define RESTRICTED_READ  1              // ditto, but limited to public dirs
#define WRITE_LIMIT_READ 2              // access limited by write access
#endif

/* define as (ie set to) one of the flags above */
#define READ_LEVEL (VALID_READ)

#if 0
/*
 * (copied from ftpd.h)
 * these flags determine write level access (values are intentionally unique...
 * and are manually generated, so don't change them)
 */
#define VALID_WRITE      0              // rely on valid_write()
#define RESTRICTED_WRITE 1              // ditto, but limited to public dirs
#define READ_ONLY        2              // no write access, at all
#endif

/* define as (ie set to) one of the flags above */
#define WRITE_LEVEL (RESTRICTED_WRITE)

/* define the following public dirs that you'll limit access to
 * for RESTRICTED_READ and/or RESTRICTED_WRITE; undefine any for which
 * the directory doesn't exist on your system
 */
#define PUB_DIR "/u"
#undef FTP_DIR "/ftp"

/* define this array as the only set of users permitted to use ftp
 * Example:
 *   #define FTP_USERS ({ "buddha", "mobydick", "watcher" })
 */
#undef FTP_USERS

/*
-----------------------------------------------
   debugging defines.
-----------------------------------------------
*/

/* define DEBUG to enable debugging info */
#undef DEBUG

/* player to whom to "tell" debugging info */
#define TP_CRE "mudren"

/*
-----------------------------------------------
   log file defines.
-----------------------------------------------
*/

/* undefine this to disable all logging */
#define LOGGING

#ifdef LOGGING
/* define this to log all connections */
#define LOG_CONNECT
/* define this to determine where to log all file xfers */
#define LOG_FILE        "ftpd"
/* define this to put a time stamp before all log entries */
#define LOG_TIME
/* define this to log cd's, time stamp, and file size commands */
#define LOG_CD_SIZE
/* define this to log failed connections */
#define LOG_NO_CONNECT

#else

#undef LOG_CONNECT
#undef LOG_FILE
#undef LOG_CD_SIZE
#undef LOG_TIME
#undef LOG_NO_CONNECT

#endif /* LOGGING */

/*
-----------------------------------------------
   consistency checks
-----------------------------------------------
*/

/* restricting ftp to a limited number of users and having anon ftp
 * at the same time is pointless
 */
#if defined(ANONYMOUS_FTP) && defined(FTP_USERS)
#undef ANONYMOUS_FTP
#endif

/*
 * server should restrict anonymous ftp by using a restricted directory
 */
#if defined(ANONYMOUS_FTP) && !defined(FTP_DIR)
#undef ANONYMOUS_FTP
#endif

/* guest wizards, if permitted to login, need some place to go */
#if defined(GUEST_WIZARD_FTP) && !defined(PUB_DIR)
#define PUB_DIR "/"
#endif

#endif /* _FTPDCONF_H */
