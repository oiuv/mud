/* ftpdsupp.h: ftpd support _code_ */

#ifndef _FTPDSUPP_H
#define _FTPDSUPP_H

#define directory_exists(p) (file_size(p)==-2)
#define file_exists(p) (file_size(p)>0)

/*
 * debugging macros
 */
#ifdef DEBUG
#define TP(STR) if ( find_player( TP_CRE ) ) tell_object( find_player( TP_CRE ), STR )
#define DEBUG_SEND   /* define to debug data_write_callback() */
#else
#define TP(STR)
#define DEBUG_SEND
#endif /* DEBUG */

#define CHECK_LOGIN() if (!socket_info[ fd ][ LOGGED_IN ]) { socket_write(fd, "530 Please login with USER and PASS.\n"); break; }

#define CHECK_CMD(x)  if (sizeof(command) == x) { socket_write( fd, sprintf("500 '%s': command not understood.\n", command[ 0 ]) ); break; }

/*
 * check_access determines who is allowed to use ftp (assuming the correct
 * password is known).  if check_access() returns 0 then the user is
 * disallowed even if the user knows the password.
 */
int check_access(string name)
{
//string file;

#ifdef FTP_USERS
    if (!sizeof(FTP_USERS))
        return 0;
    return (member_array(name, FTP_USERS) != -1) ? 1 : 0;
#else

#ifdef ANONYMOUS_FTP
    if ( name == "anonymous" )
        return 1;
#endif /* ANONYMOUS_FTP */

#ifdef GUEST_WIZARD_FTP
        return wizhood(name) != "(player)";
#else
    // This is if you require users to have a home directory
    //  in order to use ftp.
    return directory_exists(HOME_DIR(name)); /* tmi-2 simul_efun */
#endif

#endif /* FTP_USERS */
}

/*
 * return 1 if user named 'name' has password of 'plaintext'
 */
int check_password(string name, string plaintext)
{
    string fancytext, cpass;
    object login_ob;

#ifdef ANONYMOUS_FTP
    if ( name == "anonymous" ) {
        // Currently guest's email address is not verified from USITE;
        // consider supporting:
        //   name@some.ip.dot.address (from USITE and/or socket_address(fd))
        //   name@some.domain.name (from USITE)
        //   name@some-mud (reverse DNS lookup)
        if (!plaintext || plaintext == "")
            return 0;
        else if( sizeof(plaintext) < 12 ) return 0;
        else if( plaintext[sizeof(plaintext)-1..sizeof(plaintext)] == "@")
                return 0;
        else if (member_array(plaintext, ({ "none", "guest", "anon",
              "anonymous", "none@none"}) ) != -1)
            return 0;
        else
            return 1;
    }
#endif /* ANONYMOUS_FTP */

    /*
     * This is a good example of differences in mudlib design
     *   1) export_uid() vs creator_file() on setting a new object's uid
     *   2) query_password() vs query("password")
     */
#if 0
    seteuid(name)
    login_ob = new(LOGIN_OB);
    seteuid(getuid());

    login_ob->load_me(name);
    fancytext = (string)login_ob->query_password();
#else
    seteuid(getuid());
    login_ob = new(LOGIN_OB);

    // set login object's uid
    seteuid(name);
    export_uid(login_ob);

    // now set login object's name
    seteuid( getuid() );
    login_ob->set("id", name);

    // get login object's password
    login_ob->restore();
    fancytext = (string)login_ob->query("password");
#endif

    reload_object(login_ob);
    destruct(login_ob);

    if (!fancytext || !plaintext) {
        return 0;
    }

    cpass = crypt(plaintext, fancytext);

    return (cpass == fancytext);
}

/*
 * determines if "who" is allowed to connect from this site
 * by using the same args used by the user in his/her .login file for
 * the sitecheck command
 */
#ifdef CHECK_SITE
/*
 * compare dot portions (address components) of ip number (dotted decimal/
 * dotted quad) with an ip number pattern (ie containing wildcard(s))
 * - returns 1 if a match, 0 otherwise
 */
protected int dot_match(string *site, string *pattern, int flag) {
    int i, j;

    j = sizeof(pattern);
    if (j != 4)
        return 0;

    while (j--) {
        if (flag) {
            /*
             * match any octect
             */
            if (pattern[j] == "*")
                continue;
        } else {
            /*
             * be strict (last octect only)
             */
            if (j == 3 && pattern[3] == "*")
                continue;
        }

        /*
         * component doesn't match
         */
        if (site[j] != pattern[j])
            return 0;
    }

    /*
     * by process of elimination...it must match
     */
    return 1;
}

int check_site(string who, int fd) {
    int wildcard_flag;
    string site, site_num;
    string arg;
    string *sites;
    object ob;
    int i, s, l1, l2;
    string *site_dots, *match_dots;

    site = USITE;

    /*
     * get site list (if any)
     */
    if (site && site != "" && file_size(HOME_DIR(who)) == -2 &&
          file_size(HOME_DIR(who) + ".login") > 0) {
        arg = read_file(HOME_DIR(who) + ".login");
        if (arg && strlen(arg)) {
            sites = explode(arg, "\n");
            sites = regexp(sites, "^sitecheck ");
            if (sites && sizeof(sites)) {
                arg = sites[0][10..-1];

                /*
                 * parse command line args
                 */
                arg = replace_string(arg, ",", " ");
                sites = explode(lower_case(arg), " ");

                /*
                 * check for options
                 */
                if (sites[0][0] == '-') {
                    // at the moment, we don't respect the presence of
                    // the -t (test) flag (ie allow the user to login
                    // anyways), and we don't respect the absense of the
                    // -d (destruct) flag, choosing to always drop the
                    // connection if the site check fails

                    if (strsrch(sites[0], 'w') != -1)
                        wildcard_flag = 1;
                }

                /*
                 * check list of accepted sites
                 *   1) check for perfect match
                 */
                site = lower_case(site);
                if (member_array(site, sites) != -1)
                    return 1;

                /*
                 *   2) check ip number (from ip name)
                 */
                if (sscanf(site, "%*d.%*d.%*d.%*d") != 4) {
                    site_num = socket_address(fd);
                    sscanf( site_num, "%s %*s", site_num );
                    if (member_array(site_num, sites) != -1)
                        return 1;
                } else {
                    site_num = site;
                    site = 0;
                }

                /*
                 * LAST: loop through wildcards in sites[]
                 *   Note: sites[] is altered
                 */
                if (strsrch(arg, '*') != -1) {
                    /*
                     * here's a quick filter :)
                     */
                    sites = regexp(sites, "\\*");
                    if (sites && (s = sizeof(sites))) {
                        /*
                         * check site ip name;
                         * default only allows '*' as a prefix,
                         *   ie "*.domain.name"
                         */
                        if (site) {
                            l1 = strlen(site);
                            i = s;
                            while (i--) {
                                l2 = strlen(sites[i]) - 1;
                                if (l2 > 1 && l1 > l2 &&
                                      sites[i][0..1] == "*." &&
                                      strcmp(site[l1-l2..-1],
                                      sites[i][1..-1]) == 0)
                                    return 1;
                            }

                            if (wildcard_flag) {
                                /*
                                 * handle '*' as suffix
                                 */
                                 i = s;
                                 while (i--) {
                                     l2 = strlen(sites[i]) - 2;
                                     if (l2 > 0 && l1 > l2 &&
                                          sites[i][l2..-1] == ".*" &&
                                          strcmp(site[0..l2],
                                          sites[i][0..l2]) == 0)
                                        return 1;
                                 }
                            }
                        }

                        /*
                         * check site ip number
                         */
                        if (site_num) {
                            site_dots = explode(site_num, ".");
                            i = s;
                            while (i--) {
                                match_dots = explode(sites[i], ".");
                                if (dot_match(site_dots, match_dots,
                                      wildcard_flag))
                                    return 1;
                            }
                        }
                    }
                }

                return 0;
            }
        }
    }

    return 1;
}
#endif /* SITE_CHECK */

#endif /* _FTPDSUPP_H */
