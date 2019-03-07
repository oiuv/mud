// File     : /adm/daemons/network/messaged.c
// Created  : 2000-03-23
// By       : doing
//
// This is the daemon that support reliable message passing
// cross inet.
//

#include <ansi.h>
#include <mudlib.h>
#include <socket_err.h>
#include <net/messaged.h>
#include <net/dns.h>
#include <net/config.h>
#include <net/socket.h>
#include <getconfig.h>

inherit F_DBASE;

#define ENABLE_LOG              1

#if ENABLE_LOG
#define DEBUG_OUT(msg)          if (find_player("ivy")) tell_object(find_player("ivy"), (msg) + "\n")
#else
#define DEBUG_OUT(msg)
#endif

#define SEP             "\x4\x4"

// global vars
// the udp port number of the mud, and the socket id of the udp socket
private int my_port;
private int socket_id;

// connection information
private mapping connection = ([ ]);
private mapping sending_queue = ([ ]);

// last error message
private string last_error_msg;
private string last_from_addr;
private string current_user;
private int    current_sequence;
private int    is_send_packet;
private int    is_send_ack;

// addr & error handle
private void   send_udp(string addr, string msg);
private int    startup_udp();
private void   set_last_addr(string addr);
private string query_last_addr();
private void   set_current_user(string user, int sequence);
private string query_current_user();
private int    query_current_sequence();
private int    error_handle(int n);

// function handle
private void handle_msg(mapping info);
private int  user_logon(mapping info);
private void call_fun(mapping info);
private int  fun_logout(mapping info);

// others
private void reply_ack(object user);
private void receive_ack(mapping info);
varargs private void notice_user(mixed user, string fun, string msg, string add);
private int  ready_to_send(object user, mapping info, mixed notice, mixed finish);
private int  direct_send(object user);
private void sort_packet(mixed *packet);
private int  queue_msg(string msgto, mapping send_info, mixed user, mixed finish);
private void acktell(object from, object to, string msg);
private void save_data(object user);
varargs private void copy_dbase(object dst, object src, string *item);

// globals function
int     error_msg(string msg);
string  query_last_error();
object  find_user(string user);
object  find_chatter(string user);
void    remove_user(object user);
int     send_msg_to(mixed user, string msgto, string msg);
varargs void tell_user(mixed user, string fun, string msg, string add);
string  reject_tell(mixed user1, mixed user2);
mixed   query_connection(string user);
mixed   query_sending_queue(object user);
varargs void send_env(mixed user, mixed which);
void    user_logout(mixed user, string msg);

// this function binds our listening socket, and requests a mudlist
private int startup_udp()
{
	int err_no;
	return 0;

	if (socket_id) return 0;

	socket_id = socket_create(DATAGRAM, "read_callback", "close_callback");
	if (socket_id < 0)
        {
		log_file("messaged", "Failed to acquire socket.\n");
		return 0;
	}

	err_no = socket_bind(socket_id, my_port);
	while (err_no == EEADDRINUSE)
        {
		my_port++;
		err_no = socket_bind(socket_id, my_port);
	}
	if (err_no <= 0)
        {
		log_file("messaged", sprintf("Failed to bind socket of "
                                             "UDP services, error = %d.\n",
                                             err_no));
		socket_close(socket_id);
		return 0;
	}

	return 1;
}

// this is the function used by the udp slave daemons to send packets
private void send_udp(string addr, string msg)
{
        if (! addr || ! msg) return;        
	socket_write(socket_id, msg, addr);
}

// register an error message
int error_msg(string msg)
{
        last_error_msg = msg;
        return 0;
}

// query the last error message
string query_last_error()
{
        return last_error_msg;
}

// set the last address info
private void set_last_addr(string addr)
{
        last_from_addr = addr;
}

// query the last address info
private string query_last_addr()
{
        return last_from_addr;
}

// set the current user calling in
private void set_current_user(string user, int sequence)
{
        current_user = user;
        current_sequence = sequence;
}

// return the current user calling in
private string query_current_user()
{
        return current_user;
}

// return the current user calling in
private int query_current_sequence()
{
        return current_sequence;
}

// handle the error
private int error_handle(int n)
{
        string fullmsg;

        if (n) return n;

        fullmsg = sprintf("%s:%d" SEP "%s:%s",
                          ACK, query_current_sequence(),
                          ERROR, last_error_msg);
        DEBUG_OUT(HIR "Error:" + fullmsg + NOR "\n");
        send_udp(last_from_addr, fullmsg);
        return 0;
}

// this is called when we receive a udp packet.  We determine which
// service the packet is for, and send it to the auxiliary daemon of
// that name
private void read_callback(int sock, string msg, string addr)
{
        mixed user;     // calling user
        string index;   // message item's index
        string value;   // message item's value
        mapping info = ([ ]);   // total message item

        DEBUG_OUT("MSG: Got " + msg);

        while (sscanf(msg, "%s:%s" SEP "%s", index, value, msg) == 3)
                info[index] = value;

        if (sscanf(msg, "%s:%s", index, value) == 2)
                info[index] = value;

        if (stringp(info[SEQUENCE]))
                sscanf(info[SEQUENCE], "%d", info[SEQUENCE]);

        if (stringp(info[ACK]))
                sscanf(info[ACK], "%d", info[ACK]);

        // message without user info
        if (! stringp(user = info[USER]))
                // I should drop it
                return;

        // set all the current information, the user is unknow
        // now.
        set_last_addr(addr);
        set_current_user(user, info[SEQUENCE]);
        error_msg(0);

        // clear the operation flags
        is_send_packet = 0;
        is_send_ack = 0;

        handle_msg(info);

        if (objectp(user = find_chatter(user)))
        {
                DEBUG_OUT(sprintf("Send packet:%d  Send ack:%d",
                                  is_send_packet, is_send_ack));
                // Does I need to send packet in queue or send an
                // ack to input packet ?
                if (is_send_packet)
                        direct_send(user);
                else
                if (is_send_ack)
                        reply_ack(user);
        }

        // remove current information
        set_last_addr(0);
        set_current_user(0, 0);
}

// handle the message
private void handle_msg(mapping info)
{
        object me;      // the user object
        mapping my;     // me's dbase
        int sequence;   // sequence of the message packet
        string user;    // calling user

        sequence = info[SEQUENCE];
        user = info[USER];

        if (intp(info[ACK]))
        {
                // pass ack to me ?
                receive_ack(info);
        }

        if (undefinedp(info[SEQUENCE]))
                return;

        // I will look up the sequence
        if (objectp(me = connection[user]))
        {
                my = me->query_entire_temp_dbase();
                if (! my)
                {
                        destruct(me);
                        return;
                }
                my[KEEP_ALIVE] = time();

                if (my[SEQUENCE] == sequence)
                {
                        // I must have handle it
                        if (info[FUNCTION] == FUN_LOGON)
                        {
                                // the logon packet, I should reply with
                                // my sequence
                                my[ADDRESS] = query_last_addr();
                                send_udp(my[ADDRESS],
                                         sprintf("%s:%d" SEP "%s:%d",
                                                 SEQUENCE, my[MY_SEQ] - 1,
                                                 ACK, my[SEQUENCE]));
                        } else
                                is_send_ack = 1;
                        return;
                }

                if (my[SEQUENCE] + 1 == sequence)
                {
                        // Oh, this is the next request, I will
                        // record the sequence & new address
                        my[SEQUENCE] = sequence;
        	        my[ADDRESS] = query_last_addr();
                } else
                        // I must drop the packet with incorrent sequence
                        if (info[FUNCTION] != FUN_LOGON)
                                return;
        } else
                if (info[FUNCTION] != FUN_LOGON &&
                    info[FUNCTION] != FUN_LOGOUT)
                {
                        // The user must logon first
                        error_handle(error_msg("没有你的登录信息，请重新登录。\n"));
                        return;
                }

        call_fun(info);

        // record the error msg for request retransmit
        if (me) me->set_temp("last_error", last_error_msg);
}

// I will let a user connect with host in this function
private int user_logon(mapping info)
{
        object me;
        mapping my;
        string notice_msg;
        string user;
        string pass;
        object ob;
        object body;
//      mapping dbase;

        DEBUG_OUT(sprintf("User %s want to login.", info[USER]));
        if (! stringp(user = info[USER]) || strlen(user) < 3)
                // invalid user name
                return error_msg("非法的用户名。\n");

        if (! stringp(pass = info[PASSWORD]))
                // no password
                return error_msg("口令不正确。\n");

        ob = find_player(user);
        if (objectp(ob))
                // the user has existed
                return error_msg("该用户已经登录进入" + LOCAL_MUD_NAME() + "。\n");

        if (sizeof(connection) > MAX_CONNECTIONS)
                return error_msg("已经有太多的用户登录了。\n");

        ob = new(LOGIN_OB);
        ob->set("id", user);
        if (! ob->restore())
                // no this user
                return error_msg(LOCAL_MUD_NAME() + "中没有该用户。\n");

        if (! ob->query("registered"))
                return error_msg("该用户尚未成功注册。\n");

        if (crypt(pass, ob->query("password")) != ob->query("password"))
                return error_msg("用户口令不正确，请重新输入。\n");

        if (me = find_chatter(user))
        {
                notice_msg = "该用户已经在线，注销原先的连接。\n";
                user_logout(me, "有人从(" + query_last_addr() +
                                ")取代了你的连接。\n");
        }

        body = LOGIN_D->make_body(ob);  
        if (! objectp(body) || ! body->restore())
        {
                destruct(ob);
                if (body) destruct(body);
                return error_msg("无法读取该用户的信息，请和巫师联系。\n");
        }

        if (body->is_in_prison())
        {
                destruct(ob);
                destruct(body);
                return error_msg("你因为犯法太多，已经被关进监狱。\n");
        }

        // create chatter & record the information of the user
        me = new(CHATTER_OB);
        if (! objectp(me))
        {
                destruct(ob);
                return error_msg("暂时无法接入系统，请稍候再试。\n");
        }

        seteuid(user);
        export_uid(me);
        seteuid(getuid());

        me->setup();
        me->set_name(body->name(1), ({ user }));
        copy_dbase(me, body);

        // copy the dbase from body
        me->set_temp("link_ob", ob);
        ob->set_temp("body_ob", me);
        my = me->query_entire_temp_dbase();
        my[SEQUENCE]    = info[SEQUENCE];
        my[MY_SEQ]      = random(0x7FFFFFFF);
        my[ADDRESS]     = query_last_addr();
        my[KEEP_ALIVE]  = time();

        // clear sending queue & record the connection
        map_delete(sending_queue, user);
        connection[user] = me;

        // destruct the body, I use it only for read dbase
        destruct(body);

        // login successfully
        send_udp(my[ADDRESS],
                 sprintf("%s:%d" SEP "%s:%d",
                         SEQUENCE, my[MY_SEQ] - 1,
                         ACK, my[SEQUENCE]));

        if (! query_heart_beat())
                // start heart beat to maintance all logined user
                set_heart_beat(SLEEP_HEART_BEAT);

        if (notice_msg)
                tell_user(user, FUN_NOTICE, notice_msg);

        // 发送环境变量
        send_env(user);

        return 1;
}

// user logout
void user_logout(mixed user, string msg)
{
        if (! is_root(previous_object()))
                return;

        if (stringp(user) && ! objectp(user = find_chatter(user)))
                return;

        if (environment(user) &&
            environment(user) != find_object(VOID_OB))
        {
                // hide this object
                message("vision", HIY "一道金光闪过，" + user->name() +
                                  HIY "消失得无影无踪。\n" NOR,
                        environment(user), ({ user }));
        }

        user->set_temp("logout_notice", msg);
        remove_user(user);
}

// call the function
private void call_fun(mapping info)
{
        object me;
        string inputed;
        string fun;
        int result;

        if (undefinedp(info[FUNCTION]))
        {
                if (! stringp(info[MESSAGE]) ||
                    ! objectp(me = connection[info[USER]]))
                {
                        error_handle(error_msg("消息格式不完整。\n"));
                        return;
                }

                // This is prefix message, I will record it first
                if (stringp(inputed = me->query_temp("inputed")) &&
                    strlen(inputed) < (wizardp(me) ? MAX_WIZARD_INPUT_LEN
                                                   : MAX_PLAYER_INPUT_LEN))
                {
                        me->set_temp("inputed", inputed + info[MESSAGE]);
                } else
                {
                        me->set_temp("inputed", info[MESSAGE]);
                }
                is_send_ack = 1;
                return;
        }

        if (objectp(me = connection[info[USER]]) &&
            stringp(info[MESSAGE]))
        {
                // only function with message arrived, I will
                // clear the message, because some function such
                // as finger will send in a serial packet with
                // seperated message, BUT this function won't
                // user MESSAGE field.
                if (stringp(inputed = me->query_temp("inputed")))
                {
                        // The prefix message arrival first ?
                        info[MESSAGE] = inputed + info[MESSAGE];

                        // remove the record
                        me->delete_temp("inputed");
                }
        }

        switch (info[FUNCTION])
        {
        case FUN_LOGON:
                result = user_logon(info);
                break;

        case FUN_LOGOUT:
                result = fun_logout(info);
                break;

        case FUN_NULL:
                result = 1;
                is_send_packet = 1;
                break;

        default:
                if (! info[USER] || ! objectp(me = connection[info[USER]]))
                        result = error_msg("请先登录你的用户。\n");
                else
                if (! stringp(fun = me->find_chat_command(info[FUNCTION])))
                        result = error_msg("这个版本的消息精灵"
                                           "不支持这个功能。\n");
                else
                        result = call_other(fun, "main", me, info);

                break;
        }

        if (! result) error_handle(result); else
                      is_send_ack = 1;
}

// logout an user
private int fun_logout(mapping info)
{
        object me;

        send_udp(query_last_addr(), sprintf("ack:%d", info[SEQUENCE]));

        if (! objectp(me = find_chatter(info[USER])))
                return 1;
        DEBUG_OUT(sprintf("Logout out: %d   %O = %d\n",
                          info[SEQUENCE], me, me->query_temp(SEQUENCE)));
        if (info[SEQUENCE] == me->query_temp(SEQUENCE))
        {
                DEBUG_OUT("Destruct object...\n");

                if (environment(me) &&
                    environment(me) != find_object(VOID_OB))
                {
                        // show the disapper message
                        message("vision", HIM + me->name() +
                                          HIM "的影子越来越稀薄，"
                                          "渐渐的消失了。\n" NOR,
                                environment(me), ({ me }));
                }

                // this chatter in connecting now
                remove_user(me);
        }

        return 1;
}

// public functions
private void reply_ack(object user)
{
        string msg;

        if (direct_send(user))
                return;

        msg = sprintf("%s:%d", ACK, user->query_temp(SEQUENCE));
        if (user->query_temp("last_error"))
                msg += sprintf(SEP "%s:%s", ERROR, user->query_temp("last_error"));

        DEBUG_OUT(sprintf("Send ack(%s) to %s(%s)", msg,
                  user->query("id"), user->query_temp(ADDRESS)));
        send_udp(user->query_temp(ADDRESS), msg);
}

// I has receive the ack from user
private void receive_ack(mapping info)
{
        object me;
        mapping my;
        string user;
        mixed notice;
        mixed success;
        mixed q;

        user = info[USER];
        if (! objectp(me = connection[user]))
                // this user isn't online now
                return;

        my = me->query_entire_temp_dbase();
        if (! my)
        {
                destruct(me);
                return;
        }

        if (info[ACK] != my[MY_SEQ])
                return;

        // ok, I will move my sequence & clear failed count
        my[KEEP_ALIVE] = time();
        my[MY_SEQ]++;
        my[FAILED] = 0;

        q = sending_queue[me];
        if (arrayp(q))
        {
                if (q[0][MSG_CONT_MSG])
                {
                        q[0][MSG_RETRY] = MSG_MAX_RETRY;
                        q[0][MSG_INFO][MESSAGE] = "";
                        sort_packet(q[0]);
                        is_send_packet = 1;
                        return;
                }

                notice  = q[0][MSG_NOTICE];
                success = q[0][MSG_SUCCESS];
                q = q[1..<1];
                if (! sizeof(q))
                        map_delete(sending_queue, me);
                else
                {
                        sending_queue[me] = q;
                        is_send_packet = 1;
                }

                if (! sizeof(sending_queue))
                        set_heart_beat(SLEEP_HEART_BEAT);

                if (functionp(success))
                        success = evaluate(success);

                if (stringp(success))
                {
                        // notice back
                        if (objectp(notice))
                                tell_object(notice, success);
                        else
                        if (stringp(notice))
                                notice_user(notice, FUN_VISION, success);
                }
        }
}

// notice user a message
varargs private void notice_user(mixed user, string fun, string msg, string add)
{
        if (stringp(user) && ! objectp(user = find_user(user)))
                return;

        if (user->is_chatter())
        {
                // put the packet in queue for chatter
                ready_to_send(user, ([ FUNCTION : fun,
                                       MESSAGE  : msg,
                                       ADDITION : add ]), 0, 0);
        } else
        {
                // direct tell the user
                tell_object(user, msg);
                return;
        }
}

// because the message in pakcet may be too long to send, so
// I need to sort the message, be sure it would too long
private void sort_packet(mixed *packet)
{
        mapping info;
//      string msg;
//      string *cont;
        int i;

        info = packet[MSG_INFO];
        if (sizeof(info[MESSAGE]) > MSG_BYTES)
        {
                // Not trans in temp, I will store msg in it
                packet[MSG_CONT_MSG] = explode(info[MESSAGE], "\n");
                packet[MSG_TOTAL_LINE] = sizeof(packet[MSG_CONT_MSG]);
                if (packet[MSG_TOTAL_LINE] < 1)
                        packet[MSG_TOTAL_LINE] = 1;
                info[MESSAGE] = "";
        }

        if (! packet[MSG_CONT_MSG])
                return;

        for (i = 0; i < sizeof(packet[MSG_CONT_MSG]); i++)
        {
                if (strlen(info[MESSAGE]) +
                    strlen(packet[MSG_CONT_MSG][i]) >= MSG_BYTES)
                        break;
                info[MESSAGE] += packet[MSG_CONT_MSG][i] + "\n";
        }

        packet[MSG_HAS_SENT] += i;
        if (i >= sizeof(packet[MSG_CONT_MSG]))
                packet[MSG_CONT_MSG] = 0;
        else
                packet[MSG_CONT_MSG] = packet[MSG_CONT_MSG][i..<1];
}

// try to add a packet in queue to send
private int ready_to_send(object user, mapping info, mixed notice, mixed finish)
{
        mixed *packet;
        mixed q;
        int n;

        DEBUG_OUT(sprintf("Ready send: User=%O msg=%O notice=%O finish=%O",
                          user, keys(info), notice, finish));

        if (sizeof(sending_queue[user]) >= MAX_PACKET_IN_Q)
                return 0;

        // append to last ?
        if (! notice && ! finish &&
            (info[FUNCTION] == FUN_VISION) &&
            arrayp(q = sending_queue[user]) &&
            (n = sizeof(q) - 1) >= 1 &&
            q[n][MSG_INFO][FUNCTION] == info[FUNCTION] &&
            ! q[n][MSG_NOTICE] && ! q[n][MSG_SUCCESS] &&
            sizeof(q[n][MSG_CONT_MSG]) < MSG_BUFFER_LINES)
        {
                // ok, the last packet is not lag & without
                // recall function, smae as me, I will append to it
                if (! q[n][MSG_CONT_MSG])
                {
                        // no continue message, I will add to this
                        // page & sort again
                        q[n][MSG_INFO][MESSAGE] += info[MESSAGE];
                        sort_packet(q[n]);
                } else
                        q[n][MSG_CONT_MSG] += explode(info[MESSAGE], "\n");

                DEBUG_OUT(HIW "Message append to " + n + "." NOR);
                return 1;
        }

        // create a new packet
        packet = allocate(8);
        packet[MSG_INFO] = info;
        packet[MSG_RETRY] = MSG_MAX_RETRY;
        packet[MSG_NOTICE] = notice;
        packet[MSG_SUCCESS] = finish;
        packet[MSG_LAST_SEND] = 0;
        packet[MSG_CONT_MSG] = 0;
        packet[MSG_TOTAL_LINE] = 0;
        packet[MSG_HAS_SENT] = 0;
        sort_packet(packet);

        if (! arrayp(sending_queue[user]))
        {
                sending_queue[user] = ({ packet });
                if (user != connection[query_current_user()])
                        // other object call me to send, so I
                        // must send now
                        direct_send(user);
                else
                        is_send_packet = 1;
        } else
                sending_queue[user] += ({ packet });

        set_heart_beat(1);
        return 1;
}

// direct to send to packet to user
private int direct_send(object user)
{
        mapping my;
        mixed q;
        string msg;
        string ks;
//      string trans;

        DEBUG_OUT(sprintf("Direct send: User=%O", user));

        q = sending_queue[user];
        if (! arrayp(q) || ! sizeof(q))
        {
                map_delete(sending_queue, user);
                return 0;
        }

        q[0][MSG_LAST_SEND] = time();
        my = user->query_entire_temp_dbase();
        if (! my)
        {
                destruct(user);
                return 0;
        }

        if (! is_send_ack && q[0][MSG_RETRY]-- < 1)
        {
                if (user->add_temp(FAILED, 1) > MAX_SEND_FAILED)
                {
                        // too many failed, or the user has disonnected,
                        // I think I should clear this user
                        if (q[0][MSG_NOTICE])
                        {
                                notice_user(q[0][MSG_NOTICE], FUN_NOTICE,
                                            "已经与该用户" + user->full_name() +
                                            "失去联系。\n");
                        }
                        remove_user(user);

                        // stop heart beat if no packet in queue
                        if (! sizeof(sending_queue))
                                set_heart_beat(SLEEP_HEART_BEAT);
                        return 0;
                }

                if (q[0][MSG_NOTICE])
                {
                        notice_user(q[0][MSG_NOTICE], FUN_NOTICE,
                                    "无法向" + user->full_name() +
                                    "发送消息。\n");
                }

                // drop all packet in the sending queue
                map_delete(sending_queue, user);

                // stop heart beat if no packet in queue
                if (! sizeof(sending_queue))
                        set_heart_beat(SLEEP_HEART_BEAT);
                return 0;
        }

        msg = sprintf("%s:%d", SEQUENCE, my[MY_SEQ]);

        // If the message too long to send, I will send it
        // one segment than one segment, At last I will append
        // the function & other field, But, that's a exception
        // for function:tell, because client can received "tell"
        // seperated.
        if (q[0][MSG_INFO][FUNCTION] == FUN_VISION ||
            ! q[0][MSG_CONT_MSG])
        {
                // append all fields
                foreach (ks in keys(q[0][MSG_INFO]))
                        msg = sprintf("%s" SEP "%s:%s", msg, ks, q[0][MSG_INFO][ks]);
        } else
                // only append message field
                msg += sprintf("%s" SEP "%s:%s" SEP "send:%d",
                               msg, MESSAGE, q[0][MSG_INFO][MESSAGE],
                               q[0][MSG_HAS_SENT] * 100 / q[0][MSG_TOTAL_LINE]);

        if (is_send_ack)
        {
                msg += sprintf(SEP "%s:%d", ACK, my[SEQUENCE]);

                // error msg must be sent with ack
                if (user->query_temp("last_error"))
                        msg += sprintf(SEP "%s:%s", ERROR,
                                       user->query_temp("last_error"));
        }

        // send the msg to peer
        DEBUG_OUT(sprintf("Send message: %s", msg));
        send_udp(my[ADDRESS], msg);
        return 1;
}

// send a message to user, I must assure the message will
// arrival, If I haven't receive the confirm message I should
// send the message again.
private int queue_msg(object msgto, mapping send_info, mixed user, mixed finish)
{
//      string addr;

        if (! msgto->is_chatter())
        {
                // direct send
                if (send_info[ERROR])
                        // error occur
                        tell_object(msgto, HIR + send_info[ERROR]);
                else
                {
                        // normal function
                        switch (send_info[FUNCTION])
                        {
                        case FUN_VISION:
                        case FUN_NOTICE:
                                tell_object(msgto, send_info[MESSAGE]);
                                break;

                        case FUN_TELL:
                                tell_object(msgto, HIG + send_info[NAME] + "(" +
                                            send_info[USER] + ")告诉你：" +
                                            replace_string(send_info[MESSAGE], "\n", "\n ") +
                                            "\n" NOR);
                                break;

                        case FUN_ACKTELL:
                                tell_object(msgto, sprintf(HIG "你告诉%s" HIG
                                                           "(%s)：%s\n" NOR,
                                                           send_info[NAME],
                                                           send_info[USER],
                                                           send_info[MESSAGE]));
                        }
                }

                if (functionp(finish))
                        finish = evaluate(finish, user);
                if (stringp(finish))
                        notice_user(user, FUN_VISION, finish);
                return 1;
        }

        if (! ready_to_send(msgto, send_info, user, finish))
        {
                notice_user(user, FUN_NOTICE, "系统正繁忙，无法代你发送该消息。\n");
                return 0;
        }

        return 1;
}

// save the dbase of the user
private void save_data(object user)
{
        object login_ob;
        object body;

        // save the dbase of the user
        login_ob = user->query_temp("link_ob");
        body = 0;
        for (;;)
        {
                if (! login_ob)
                {
                        // No found the login object information,
                        // So I should reload it
                        login_ob = new(LOGIN_OB);
                        login_ob->set("id", geteuid(user));
                        if (! login_ob->restore())
                                break;
                }

                // record login object data
                login_ob->set("last_on", time());
                login_ob->set("last_from", user->query_temp(ADDRESS));
                login_ob->save();

                // record body object data
                body = LOGIN_D->make_body(login_ob);
                if (! body || ! body->restore())
                        break;

                copy_dbase(body, user, ({ "env", "channels",
                                          "cwd", "cwf", "board_last_read" }));
                body->save();
                break;
        }

        if (objectp(login_ob)) destruct(login_ob);
        if (objectp(body)) destruct(body);
}

// copy dbase from one object to another object
void copy_dbase(object dst, object src, string *item)
{
        string ks;
        mapping dmap, smap;

        dmap = dst->query_entire_dbase();
        smap = src->query_entire_dbase();
        foreach (ks in keys(smap))
        {
                if (arrayp(item) && member_array(ks, item) == -1)
                        continue;
                dmap[ks] = smap[ks];
        }
}

// heart beat function
// I will re send all the packet in queue
private void heart_beat()
{
        mixed me;
        mapping my;
        string user;
        int t;

        DEBUG_OUT(HIR "Start heart beat." NOR);

        // only send packet, don't with ack
        is_send_ack = 0;

        // send packet in queue
        foreach (me in keys(sending_queue))
        {
                if (! objectp(me))
                {
                        map_delete(sending_queue, me);
                        continue;
                }
                direct_send(me);
        }

        reset_eval_cost();

        if (! sizeof(connection))
        {
                DEBUG_OUT(HIY "Stop heart beat." NOR);
                set_heart_beat(0);
                return;
        }

        t = time();
        // keep alive of all user
        foreach (user in keys(connection))
        {
                if (! objectp(me = connection[user]))
                {
                        map_delete(connection, user);
                        continue;
                }

                my = me->query_entire_temp_dbase();
                if (! my)
                {
                        destruct(me);
                        continue;
                }

                if (t - my[KEEP_ALIVE] >= KEEP_ALIVE_PERIOD)
                {
                        // send a null command to peer
                        ready_to_send(me, ([ FUNCTION : FUN_NULL ]), 0, 0);

                        // I will send next null command after
                        // 20s if I won't receive the command ack
                        my[KEEP_ALIVE] += MSG_MAX_RETRY + 1;

                        DEBUG_OUT(sprintf("User %s's keep alive"
                                          " packet sent.", user));
                }
        }

        DEBUG_OUT(HIW "End of this heart beat." NOR);
}

// If user 2 is visible for user 1, the function will return 1,
// else return 0
int visible(mixed user1, mixed user2)
{
	if (user1 && wiz_level(user1) >= wiz_level(user2))
                return 1;

        // load the environment variable from user2
        if (stringp(user2))
                user2 = find_user(user2);

        if (! objectp(user2))
                return 1;

        if (objectp(user1))
                return user1->visible(user2);

        // check the setting: invisble
        if (user2->query("env/invisible"))
                return 0;

        return 1;
}

// send user's envrionment to client
varargs void send_env(mixed user, mixed which)
{
        object ob;
        string msg;
        string ks;
        string *inc;
        mapping env;

        if (! is_root(previous_object()))
                return;

        if (! objectp(ob = user) && ! objectp(ob = connection[user]))
                return;

        msg = "";
        if (mapp(env = ob->query("env")))
        {
                if (stringp(which))
                        inc = filter_array(explode(which, ","), (: ! undefinedp($(env)[$1]) :));
                else
                if (arrayp(which))
                        inc = which;
                else
                        inc = keys(env);

                foreach (ks in inc)
                {
                        // generate environment string
                        msg += ks + "=" +
                               sprintf(intp(env[ks]) ? "%d" :
                                       stringp(env[ks]) ? "%s" : "%O",
                                       env[ks]) + "\n";
                }
        }

        ready_to_send(ob, ([ FUNCTION : FUN_SEND_ENV,
                             MESSAGE : msg ]), 0, 0);
}

// can player 1 tell with user 2 ?
string reject_tell(object user1, object user2)
{
        string to_name;
        string no_tell; 
        string can_tell;

        no_tell = user2->query("env/no_tell");
        can_tell = user2->query("env/can_tell");

        to_name = user2->name(1) + "(" + user2->query("id") + ")";
	if (! wiz_level(user1) && (no_tell == "all" || no_tell == "ALL" ||
	    is_sub(user1->query("id"), no_tell)))
        {
                if (! is_sub(user1->query("id"), can_tell))
                {
                        if (! visible(user1, user2))
                                return "这个用户没有登录，你无法和他交谈。\n";
                        else
		                return to_name + "不想听你罗嗦啦。\n";
                }
        }

        if (! user2->is_chatter())
        {
                // check target's connection status
                if (! interactive(user2))
                        return to_name + "现在不在线上，无法听到你的话。\n";

                // check target's connection status
                if (! living(user2))
                        return to_name + "现在昏迷不醒，听不到你说的话。\n";
        }

        // user1 can tell to user2
        return 0;
}

// globals functions
// find a chatter object
object find_chatter(string user)
{
        return connection[user];
}

// find a user (player/chatter) object
object find_user(string user)
{
        object ob;

        if (! (ob = find_player(user)))
            ob = find_chatter(user);

        return ob;
}

// remove a user from connection
void remove_user(object user)
{
        string msg;

        if (! is_root(previous_object()) &&
            previous_object() != user)
                error("You can not destruct the user\n");

        if (connection[user->query("id")] == user)
        {
                // Am I in connection now ?
                map_delete(connection, user->query("id"));
                save_data(user);
        }

        // clear the queue
        map_delete(sending_queue, user);

        // destruct the object of the user
        if (user->query_temp(ADDRESS) &&
            stringp(msg = user->query_temp("logout_notice")))
        {
                send_udp(user->query_temp(ADDRESS),
                         sprintf("%s:%s" SEP "%s:%s",
                                 FUNCTION, FUN_LOGOUT,
                                 MESSAGE, msg));
        }

        if (objectp(user->query_temp("link_ob")))
                // Is the link object existed now ?
                destruct(user->query_temp("link_ob"));

        destruct(user);
}

// send a msg to a user
int send_msg_to(mixed user, string msgto, string msg)
{
        object from;
        object to;
        string reply;
        string mud;
        int i;

        if (! is_root(previous_object()))
                return 0;

        if (! objectp(from = user) &&
            ! objectp(from = find_user(user)))
                return error_msg("你没有正常登录，无法进行交谈。\n");
            
        if (sscanf(msgto, "%s@%s", msgto, mud) == 2)
		if (GTELL->send_gtell(mud, msgto, user, msg,
                        stringp(user) ? connection[user][NAME] : 0))
		{
			notice_user(user, FUN_VISION, HIY "网际讯息已送出，可能"
                                    "要稍候才能得到回应。\n" NOR);
			return 1;
		}

        // get to user object if existed
        if (! objectp(to = find_user(msgto)))
        {
                notice_user(from, FUN_NOTICE,
                            "这个用户没有登录，你无法和他交谈。\n");
                return 1;
        }

        if (to == from)
        {
                notice_user(from, FUN_NOTICE,
                            "自己对自己说话？似乎无此必要。\n");
                return 1;
        }

        if (! to->is_chatter())
                to->set_temp("reply", from->query("id"));

        if (reply = reject_tell(from, to))
        {
                // reject the tell from user
                notice_user(from, FUN_NOTICE, reply);
                return 1;
        }

        // remove last enter of the message
        i = strlen(msg);
        while ((--i) >= 0 && msg[i] == '\n');
        if (i < 0) return 1;
        msg = msg[0..i];
        reply = msg;

        // remote tell
        queue_msg(to, ([ USER : from->query("id"),
                         NAME : from->name(1),
                         FUNCTION : FUN_TELL,
                         MESSAGE : msg ]),
                  from, (: acktell, from, to, reply :));

        return 1;
}

private void acktell(object from, object to, string msg)
{
        if (! to || ! from) return;
        queue_msg(from, ([ USER : to->query("id"),
                           NAME : to->name(1),
                           FUNCTION : FUN_ACKTELL,
                           MESSAGE : msg ]), 0, 0);

        // target online & idle now ?
        if (interactive(to) && query_idle(to) >= 120)
        {
                notice_user(from, FUN_VISION,
                         YEL "可是" + gender_pronoun(to->query("gender")) +
                         "已经发呆" + chinese_number(query_idle(to) / 60) +
                         "分钟了，恐怕听不到你说的话。\n" NOR);
        }

}

// send message to direct user
varargs void tell_user(mixed user, string fun, string msg, string add)
{
        notice_user(user, fun, msg, add);
}

// used to inform the slave daemons of the udp port
int query_udp_port() {	return my_port; }

// query connection info
mixed query_connection(string user)
{
        if (! user)
                return connection;

        return connection[user];
}

// query connection info
mixed query_sending_queue(object user)
{
        if (! user)
                return sending_queue;

        return sending_queue[user];
}

void remove()
{
}

void create()
{
        object *obs;
        object ob;

        seteuid(getuid());
        set("channel_id", "消息精灵");
        my_port = LOCAL_PORT() + MESSAGE_PORT;
        startup_udp();

        // create connection list
        obs = filter_array(children(CHATTER_OB),
                (: $1->is_chatter() :));
        foreach (ob in obs)
        {
                if (ob->query_temp("disconnected"))
                {
                        // this object should be removed
                        destruct(ob);
                        continue;
                }
                connection[ob->query("id")] = ob;
        }

        if (sizeof(connection))
                // Am I need start heart beaten ?
                set_heart_beat(SLEEP_HEART_BEAT);
}
