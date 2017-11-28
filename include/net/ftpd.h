/* ftpd.h */
#ifndef __FTPD_H
#define __FTPD_H
#define POS             1
#define DATA            2
#define USER_NAME       3
#define LOGGED_IN       4
#define CWD             5
#define LEN             6
#define PARENT_FD       7
#define DATA_FD         8
#define DATA_ADDR       9
#define LAST_DATA       10
#define DATA_PORT       11
#define FILE            12
#define TYPE            13
#define DOWNLOAD        14
#define PATH            15
#define APPEND          16
#define CONNECTED       17
#define USER_SITE       18
#define STRING          19
#define BINARY          20
#define FROMNAME        21
#define IDLE_SETTING    22
#define TRANSFER_MODE   23

#define FTP_TIME        (sprintf("[%s] ", ctime(time())[4..15]))
#define UNAME   socket_info[ fd ][ USER_NAME ]
#define UCWD    socket_info[ fd ][ CWD ]
#define UTYPE   socket_info[ fd ][ TYPE ]
#define USITE   socket_info[ fd ][ USER_SITE ]
#define UPATH   socket_info[ fd ][ PATH ]
#define UDATA   socket_info[ fd ][ DATA ]
#define MAX_UNIQUE_TRIES 10
#define MONTHS ({ "Jan", "Feb", "Mar", "Apr", "May", "Jun", \
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" })
#define SECS_IN_YEAR (365 * 24 * 60 * 60)
/*
 * Listed of recognized commands in order defined in RFC 765
 *   ({ Command, Implemented?, Help text })
 */
mapping cmdtab = ([
    "user" : ({ "USER", 1, "<sp> username" }),
    "pass" : ({ "PASS", 1, "<sp> password" }),
    "acct" : ({ "ACCT", 0, "(specify account)" }),
    "smnt" : ({ "SMNT", 0, "(structure mount)" }),
    "rein" : ({ "REIN", 0, "(reinitialize server state)" }),
    "quit" : ({ "QUIT", 1, "(terminate service)", }),
    "port" : ({ "PORT", 1, "<sp> b0, b1, b2, b3, b4" }),
    "pasv" : ({ "PASV", 0, "(set server in passive mode)" }),
    "type" : ({ "TYPE", 1, "<sp> [ A | E | I | L ]" }),
    "stru" : ({ "STRU", 0, "(specify file structure)" }),
    "mode" : ({ "MODE", 0, "(specify transfer mode)" }),
    "retr" : ({ "RETR", 1, "<sp> file-name" }),
    "stor" : ({ "STOR", 1, "<sp> file-name" }),
    "appe" : ({ "APPE", 1, "<sp> file-name" }),
    "mlfl" : ({ "MLFL", 0, "(mail file)" }),
    "mail" : ({ "MAIL", 0, "(mail to user)" }),
    "msnd" : ({ "MSND", 0, "(mail send to terminal)" }),
    "msom" : ({ "MSOM", 0, "(mail send to terminal or mailbox)" }),
    "msam" : ({ "MSAM", 0, "(mail send to terminal and mailbox)" }),
    "mrsq" : ({ "MRSQ", 0, "(mail recipient scheme question)" }),
    "mrcp" : ({ "MRCP", 0, "(mail recipient)" }),
    "allo" : ({ "ALLO", 1, "allocate storage (vacuously)" }),
    "rest" : ({ "REST", 1, "restart command" }),
    "rnfr" : ({ "RNFR", 1, "<sp> file-name" }),
    "rnto" : ({ "RNTO", 1, "<sp> file-name" }),
    "abor" : ({ "ABOR", 1, "(abort operation)" }),
    "dele" : ({ "DELE", 1, "<sp> file-name" }),
    "cwd"  : ({ "CWD" , 1, "[ <sp> directory-name ]" }),
    "xcwd" : ({ "XCWD", 1, "[ <sp> directory-name ]" }),
    "list" : ({ "LIST", 1, "[ <sp> path-name ]" }),
    "nlst" : ({ "NLST", 1, "[ <sp> path-name ]" }),
    "site" : ({ "SITE", 1, "site-cmd [ <sp> arguments ]" }),
    "syst" : ({ "SYST", 1, "(get type of operating system)" }),
    "stat" : ({ "STAT", 1, "[ <sp> path-name ]" }),
    "help" : ({ "HELP", 1, "[ <sp> <string> ]" }),
    "noop" : ({ "NOOP", 1, "" }),
    "mkd"  : ({ "MKD" , 1, "<sp> path-name" }),
    "xmkd" : ({ "XMKD", 1, "<sp> path-name" }),
    "rmd"  : ({ "RMD" , 1, "<sp> path-name" }),
    "xrmd" : ({ "XRMD", 1, "<sp> path-name" }),
    "pwd"  : ({ "PWD" , 1, "(return current directory)" }),
    "xpwd" : ({ "XPWD", 1, "(return current directory)" }),
    "cdup" : ({ "CDUP", 1, "(change to parent directory)" }),
    "xcup" : ({ "XCUP", 1, "(change to parent directory)" }),
    "stou" : ({ "STOU", 1, "<sp> file-name" }),
    "size" : ({ "SIZE", 1, "<sp> path-name" }),
    "mdtm" : ({ "MDTM", 1, "<sp> path-name" })
]);
mapping sitecmdtab = ([
    "idle"  : ({ "USER",  1, "[ <sp> timeout ]" }),
    "umask" : ({ "UMASK", 0, "[ <sp> umask ]" }),
    "chmod" : ({ "CHMOD", 0, "<sp> path-name" }),
    "time"  : ({ "TIME",  1, "(return local time)" }),
    "help"  : ({ "HELP",  1, "[ <sp> <string> ]" })
]);
#define PERMISSION_DENIED550(S) socket_write( fd, sprintf( \
      "550 Permission denied to %s.\n", S) )
#define PERMISSION_DENIED553(S) socket_write( fd, sprintf( \
      "553 Permission denied to %s.\n", S) )
/*
 * these flags determine read level access
 */
#define VALID_READ       0              // rely on valid_read()
#define RESTRICTED_READ  1              // ditto, but limited to public dirs
#define WRITE_LIMIT_READ 2              // access limited by write access
/*
 * these flags determine write level access
 */
#define VALID_WRITE      0              // rely on valid_write()
#define RESTRICTED_WRITE 1              // ditto, but limited to public dirs
#define READ_ONLY        2              // no write access, at all
#endif /* __FTPD_H */
