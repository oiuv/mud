// mudlib: Basis
// date:   10/10/92
// author: Truilkan@Basis
// desc:   mudwho client written for MudOS 0.9 (uses DATAGRAM sockets)

// interface:
//
//   call boot() when the mud starts up (in preload() with the code that
//     preloads other socket efun code is a good place to call it from)
//   call halt() when the mud shuts down (e.g. in a shutdown() simul_efun)
//   call add_user(user_object) for each player that logs in (don't forget
//     reconnects by netdeaders).
//   call remove_user(user_object) for each player that logs out.
//     (user::remove() may be a good place to add this call.  Also, you
//     wish to call this when netdeath occurs).

// DAEMON_IP won't need to change unless you want to point to a different
// mudwho dameon.  If you wish to use Portals as your mudwho daemon,
// you'll have to get your mud and mud password added to the Portals
// mudwho daemon database.
//
// Here is information on how to contact existing mudwho daemon admins:
// ---------------------------------------------------------------------
// riemann.math.okstate.edu
// - 139.78.1.15  6889, jds@math.okstate.edu
// amber.ecst.csuchico.edu
// - 132.241.1.43 6889, warlock@ecst.csuchico.edu
// nova.tat.physik.uni-nuebingen.de
// - 134.2.62.161 6889, gamesmgr@taurus.tat.physik.uni-tuebingen.de

#include <net/socket.h> /* includes socket_errors.h indirectly */
#include <getconfig.h>

#define DAEMON_IP "118.190.104.241" /* actlab */
#define PASSWORD "mud.ren"

// undefine this if you don't want logging of errors
#define LOG_INFO
// only has an effect if LOG_INFO is defined
#undef LOG_CALL_OUTS

// change QUERY_NAME and QUERY_LOGIN_TIME to mesh with your mudlib

#ifdef BASIS /* for Basis-derived mudlibs */
#define QUERY_NAME query(a_cap_name)
#define QUERY_LOGIN_TIME query(a_create_time)
#else
#define QUERY_NAME query("cap_name")
#define QUERY_LOGIN_TIME query("last_on")
#endif

// these values should be okay as long as you are talking to the Portals daemon
#define REFRESH_INTERVAL 390
#define KEEPALIVE_INTERVAL 120
#define PARTITIONS 10

// you shouldn't need to change anything below this comment

#define TAB "\t"
#define GENERATION "0"
#define	UDP_PORT	3160
#define CLIENT_VERSION "mwp 1.2"

STATIC_VAR_TAG string mwhod_addr;
STATIC_VAR_TAG string mudname;
STATIC_VAR_TAG string keepalive_message;
STATIC_VAR_TAG string boot_message;
STATIC_VAR_TAG string comments;
STATIC_VAR_TAG int socket;

void
log_info(string error)
{
#ifdef LOG_INFO
	log_file("cmwhod", ctime(time()) + "\n" + error);
#endif
}

void
send_data(string datagram)
{
#ifdef INTERMUD
	int rc;

	rc = socket_write(socket, datagram, mwhod_addr);
	if (rc != EESUCCESS) {
		log_info("socket_write: " + socket_error(rc) + "\n");
	}
#endif /* INTERMUD */
}

string
header(string op)
{
	return op + TAB + mudname + TAB + PASSWORD;
}

void
set_keepalive_message()
{
	/* uptime() is an efun that returns # of seconds the driver has been up */
	keepalive_message = header("M") + TAB + mudname + TAB +
		(time() - uptime()) + TAB + GENERATION + TAB + comments;
}

void
set_boot_message()
{
	boot_message = header("U") + TAB + mudname + TAB +
		(time() - uptime()) + TAB + GENERATION + TAB + comments;
}

void
set_comments()
{
	comments = __VERSION__ + "/" + CLIENT_VERSION;
}

void
add_user(object user, int which)
{
	string name, datagram;
	int userid, login_time;

	if (!user) {
		return;
	}
	userid = getoid(user);
	/* refresh approx. 1/PARTITIONS of list each time */
	if ((userid % PARTITIONS) != which) {
		return;
	}
	login_time = (int)user->QUERY_LOGIN_TIME;
	name = (string)user->QUERY_NAME;
	datagram =
		header("A")+TAB+mudname+TAB+userid+"@"+LOCAL_MUD_NAME()+
                TAB+login_time+TAB+GENERATION+TAB+name;
	send_data(datagram);
}

void
add_all_users(int which)
{
	object *all;
	int j;

	all = users();
	for (j = 0; j < sizeof(all); j++) {
		add_user(all[j], which);
	}
}

void
refresh(int which)
{
	string err;

#ifdef LOG_CALL_OUTS
	log_info("call_out: refresh " + which + "\n");
#endif
	// do the catch() so the call_out won't be lost in case of runtime error.
	err = catch(add_all_users(which));
	if (err) {
		log_info("refresh: " + err + "\n");
	}
	call_out("refresh", REFRESH_INTERVAL / PARTITIONS,
		(which + 1) % PARTITIONS);
}

/*
 * Initialize CMWHOD
 */
void
create()
{
	int error;

	rm(LOG_DIR + "/cmwhod");
	log_info(CLIENT_VERSION + ": cmwhod log for '" + LOCAL_MUD_NAME() + "'\n");
	socket = socket_create(DATAGRAM, "read", "close");
	if (socket < 0) {
		log_info("socket_create: " + socket_error(socket) + "\n");
		return;
	}
	error = socket_bind(socket, 0);
	if (error != EESUCCESS) {
		log_info("socket_bind: " + socket_error(error) + "\n");
		return;
    }
	set_comments();
	mwhod_addr = DAEMON_IP + " " + UDP_PORT;
	mudname = LOCAL_MUD_NAME();
	set_keepalive_message();
	set_boot_message();
	call_out("keepalive", KEEPALIVE_INTERVAL);
	call_out("refresh", REFRESH_INTERVAL / PARTITIONS, 0);
}

void
keepalive()
{
#ifdef LOG_CALL_OUTS
	log_info("call_out: keepalive:\n" + keepalive_message + "\n");
#endif
	/* shouldn't be able to get a runtime error here */
	send_data(keepalive_message);
	call_out("keepalive", KEEPALIVE_INTERVAL);
}

void
boot()
{
	log_info("booting");
	send_data(boot_message);
}

void
halt()
{
	log_info("halting");
	send_data(header("D"));
}

void
remove_user(object user)
{
	string datagram;
	int userid;

	userid = getoid(user); /* get number following # in file_name(user) */
	datagram = header("Z") + TAB + mudname + TAB + userid + "@" + LOCAL_MUD_NAME();
	send_data(datagram);
}
