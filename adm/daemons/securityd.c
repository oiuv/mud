// securityd.c

// #pragma optimize
// #pragma save_binary

#include <login.h>
#include <ansi.h>
#include <mudlib.h>
#include <localtime.h>

inherit F_SAVE;

string query_save_file()
{
        return DATA_DIR "securityd";
}

// By Annihilator@Eastern.Stories (11/25/94)

// This is the "effective" access status compare to the "status" property
// in login object that this mapping determine wizards' access rights
// directly. It is important to make the "status" property matches this
// mapping for wizards higher than regular wizard such as sage, arch and
// admin. For thoese users whose name doesnot appear in this mapping, they
// are divided into three groups (wizard),(player) and (object) using
// wizardp() and interactive() efun.
// The parenthesis is nessessary to prevend players naming themself "admin"
// to hack the security system.
// 
// 01/14/95 Annihilator - wiz_status are defined outside this daemon in the
//                        WIZLIST file.
// Modified by Xiang for XKX
// Updated by DOing Lu for ULTRA HELL

private STATIC_VAR_TAG mapping wiz_status = ([ ]);

private STATIC_VAR_TAG string *wiz_levels = ({
	"(player)",
	"(immortal)",
	"(apprentice)",
	"(wizard)",
	"(arch)",
	"(admin)"
});

private STATIC_VAR_TAG int seq = 0;

// A valid write attempt must pass 2 checks: your uid or status must not be
// "excluded" and must be "trusted" on that directory in order to write in 
// that directory. The directories containing the file is searched backward
// from the current directory to root. And exclude is checked prior than
// trusted.

// ultra rules
private STATIC_VAR_TAG mapping trusted_read;
private STATIC_VAR_TAG mapping exclude_read;
private STATIC_VAR_TAG mapping trusted_write;
private STATIC_VAR_TAG mapping exclude_write;

// extend rules save in diskette
private mapping extend_trusted_read;
private mapping extend_exclude_read;
private mapping extend_trusted_write;
private mapping extend_exclude_write;

// grant information for command
private mapping grant;

// grant information for sites
private mapping site_privilege;

mapping query_security(string para);
int     set_security(string para, mapping ruler);
mapping combine_rules(mapping def, mapping extend);
void    reset_security();
int     restore();
int     save();

void create()
{
        int i;

        seteuid(getuid());
        restore();
}

// 为了站点安全，需要设置自己的 SEC_SEED
#define SEC_SEED        "00000000000000000000000000000001"

int restore()
{
        string item, val;
        string sum, sec;
	string *wizlist, wiz_name, wiz_level;
        int res;
        int i;

        res = ::restore();

        // check valid of site privilege
        while (1)
        {
                if (! res)
                        break;

                if (! mapp(site_privilege) || sizeof(site_privilege) > 1024 ||
                    ! stringp(sec = site_privilege[INTERMUD_MUD_NAME]))
                {
                        // illegal data, empty privilege information
                        site_privilege = 0;
                        break;
                }

                map_delete(site_privilege, INTERMUD_MUD_NAME);

                sum = SEC_SEED;
                foreach (item in keys(site_privilege))
                {
                        if (! stringp(item) ||
                            ! stringp(val = site_privilege[item]))
                        {
                                map_delete(site_privilege, item);
                                continue;
                        }

                        for (i = 0; i < strlen(item) && i < 32; i++)
                                sum[i] = ((sum[i] - 48 + item[i]) & 0x7F) + 48;
        
                        for (i = 0; i < strlen(val) && i < 32; i++)
                                sum[i] = ((sum[i] - 48 + val[i]) & 0x7F) + 48;
                }

                if (crypt(sum, sec) != sec)
                {
                        log_file("static/security", "site_privilege information encrypted.\n");
                        site_privilege = 0;
                        break;
                }

                break;
        }

        // assure site_privilege
        if (! mapp(site_privilege))
                site_privilege = ([ ]);

        // reset the security information
        reset_security();

        // restore wizlist
	wizlist = explode(read_file(WIZLIST), "\n");
	wiz_status = allocate_mapping(sizeof(wizlist));
	for (i = 0; i < sizeof(wizlist); i++)
        {
		if (wizlist[i][0]=='#' ||
		    sscanf(wizlist[i], "%s %s", wiz_name, wiz_level) != 2 ) continue;
		wiz_status[wiz_name] = wiz_level;
	}

        // assure grant information
        if (! mapp(grant)) grant = ([ ]);

        return res;
}

int save()
{
        string item;
        string val;
        string sum;
        string sec;
        int i;

        if (! mapp(site_privilege))
                site_privilege = ([ ]);

        map_delete(site_privilege, INTERMUD_MUD_NAME);

        sum = SEC_SEED;
        foreach (item in keys(site_privilege))
        {
                if (! stringp(item) ||
                    ! stringp(val = site_privilege[item]))
                {
                        map_delete(site_privilege, item);
                        continue;
                }

                for (i = 0; i < strlen(item) && i < 32; i++)
                        sum[i] = ((sum[i] - 48 + item[i]) & 0x7F) + 48;

                for (i = 0; i < strlen(val) && i < 32; i++)
                        sum[i] = ((sum[i] - 48 + val[i]) & 0x7F) + 48;
        }

        site_privilege[INTERMUD_MUD_NAME] = crypt(sum, 0);

        return ::save();
}

mapping query_security(string para)
{
        if (! is_root(previous_object()))
                return 0;

        switch(para)
        {
        case "trusted_read":
                return trusted_read;

        case "exclude_read":
                return exclude_read;

        case "trusted_write":
                return trusted_write;

        case "exclude_write":
                return exclude_write;

        case "extend_trusted_read":
                return extend_trusted_read;

        case "extend_exclude_read":
                return extend_exclude_read;

        case "extend_trusted_write":
                return extend_trusted_write;

        case "extend_exclude_write":
                return extend_exclude_write;

        case "default_trusted_write":
                return ([
	                "/": 		({ "(admin)" }),
	                "/d":		({ "(arch)" }),
                        "/clone":       ({ "(arch)" }),
                        "/kungfu":      ({ "(arch)" }),
                        ]);

        case "default_exclude_write":
                return ([
                        "/adm":	        ({ "(arch)" }),
			"/feature":     ({ "(arch)" }),
                        "/clone/user":  ({ "(arch)" }),
			"/shadow":      ({ "(arch)" }),
                        "/binaries":    ({ "(arch)" }),
                        "/temp":        ({ "(arch)" }),
                        "/data":        ({ "(arch)" }),
                        "/version":     ({ "(arch)" }),
                        ]);

        case "default_trusted_read":
                return ([
                	"/": 		({ "(admin)", "(arch)", "(wizard)" }),
                        ]);

        case "default_exclude_read":
                return ([
	                "/adm":         ({ "(wizard)", "(arch)" }),
	                "/feature":     ({ "(wizard)", "(arch)" }),
	                "/shadow":      ({ "(wizard)", "(arch)" }),
	                "/log":         ({ "(wizard)" }),
                        "/log/file":    ({ "(arch)" }),
	                "/cmds/adm":    ({ "(arch)", "(wizard)" }),
	                "/cmds/arch":   ({ "(wizard)" }),
			"/d":           ({ "(wizard)" }),
                        "/data":        ({ "(arch)", "(wizard)" }),
                        "/backup":      ({ "(arch)", "(wizard)" }),
                        "/temp":        ({ "(arch)", "(wizard)" }),
                        "/dump":        ({ "(arch)", "(wizard)" }),
			"/kungfu":      ({ "(wizard)" }),
                        "/version":     ({ "(wizard)", "(arch)" }),
                        ]);
        }
        return 0;
}

int set_security(string para, mapping ruler)
{
        if (! is_root(previous_object()))
                return 0;

        switch(para)
        {
        case "extend_trusted_read":
                extend_trusted_read = ruler;
                break;

        case "extend_exclude_read":
                extend_exclude_read = ruler;
                break;

        case "extend_trusted_write":
                extend_trusted_write = ruler;
                break;

        case "extend_exclude_write":
                extend_exclude_write = ruler;
                break;

        default:
                return 0;
        }

        return 1;
}

// combine two mapping into a only mapping
mapping combine_rules(mapping def, mapping extend)
{
        string *ks;
	int i;

        if (! extend) return def;
        ks = keys(extend);
        for (i = 0; i < sizeof(ks); i++)
        {
                if (! arrayp(def[ks[i]]))
                        def[ks[i]] = extend[ks[i]];
                else
                        def[ks[i]] += extend[ks[i]];
        }
        return def;
}

void reset_security()
{
        if (! is_root(previous_object()))
                return 0;

        // combine the default rules with extend rules
        trusted_read  = combine_rules(query_security("default_trusted_read"),  extend_trusted_read);
        exclude_read  = combine_rules(query_security("default_exclude_read"),  extend_exclude_read);
        trusted_write = combine_rules(query_security("default_trusted_write"), extend_trusted_write);
        exclude_write = combine_rules(query_security("default_exclude_write"), extend_exclude_write);
}

string *query_wiz_levels() { return wiz_levels; }

string *query_wizlist() { return keys(wiz_status); }

// This function returns the status of an uid.
string get_status(mixed ob)
{
	string euid;
	
	if (objectp(ob))
        {
		euid = geteuid(ob);
		if (! euid) euid = getuid(ob);
	}
	else if (stringp(ob)) euid = ob;

	if (! undefinedp(wiz_status[euid]))
                return wiz_status[euid];
	else if (member_array(euid, wiz_levels) != -1) return euid;
	else return "(player)";
}

int get_wiz_level(mixed ob)
{
	return member_array(get_status(ob), wiz_levels);
}

int set_status(mixed ob, string status)
{
	string uid, *wiz, wizlist;
	int i;

	if (geteuid(previous_object()) != ROOT_UID) return 0;

	if (objectp(ob))        uid = getuid(ob);
	else if (stringp(ob))   uid = ob;
	else return 0;
	
	if (wizhood(ob) == status)
		return 1;
	if (status == "(player)")
		map_delete(wiz_status, uid);
	else
		wiz_status[uid] = status;
	wiz = keys(wiz_status);
	for (wizlist = "", i = 0; i < sizeof(wiz); i++)
		wizlist += wiz[i] + " " + wiz_status[wiz[i]] + "\n";
	rm(WIZLIST);
	write_file(WIZLIST, wizlist);
	log_file("static/promotion", log_time() + " " + capitalize(uid) +
	         " become a " + status + " by " +
		 (this_player() ? geteuid(this_player()) : "SYSTEM") + "\n");
	return 1;
}

string *get_wizlist() { return keys(wiz_status); }

// Who can destruct me? only root
void remove(string euid)
{
        if (euid != ROOT_UID && get_status(euid) != "(admin)")
                error("Only root can destruct SECURITY daemon.\n");

        return;
}

// valid_write - called by the master object to determine whether if an user
//               is allowed to write on a certain file.
// NOTE:
//     The argument user should be an object according to the source code
// of driver. However, it is a mixed type in the released docs. We assume
// it is an object in normal case here and issue an error if it was not
// an object. 												- Annihilator

int valid_write(string file, mixed user, string func)
{
	string euid, status, *path, dir;
        string *arre, *arrt;
	int i;
        int valid;

	if (! objectp(user))
        {
                if (stringp(user))
                        euid = user;
                else
		        error("TRUST_D->valid_write: Invalid argument type of user.\n");
        } else
                euid = geteuid(user);

	if (sscanf(file, LOG_DIR + "%*s") && func=="write_file") return 1;

	// Let user save their save file
	if (func == "save_object")
        {
		if ((stringp(user) ? sscanf(user, "/clone/%*s")
                                   : sscanf(file_name(user), "/clone/%*s"))
		&&	sscanf(file, "/data/%*s")
		&&	(file == (string)user->query_save_file() +  __SAVE_EXTENSION__ ||
                         file == (string)user->query_save_file()) )
                {
                        // check the object's file with id in dbase
                        if (euid && euid != getuid(user))
                        {
                                write(sprintf(HIR "【保护】你的用户标识(%s)和有效用"
                                              "户标识(%s)不同，档案不正常，不能保存。\n" NOR,
                                              getuid(user), geteuid(user)));
                                return 0;
                        }

                        if ((base_name(user) == USER_OB) &&
                            getuid(user) != user->query("id"))
                        {
                                write(sprintf(HIR "【保护】你的用户标识(%s)和数据中"
                                              "的标识(%s)不同，档案不正常，不能保存。\n" NOR,
                                              getuid(user), user->query("id")));
                                return 0;
                        }
			return 1;
                }
	}

	// Get the euid and status of the user.
	if (! euid) return 0;
	status = get_status(user);

	if (euid == ROOT_UID || status == "(admin)") return 1;

        if (stringp(user)) user = find_player(user);
        if (objectp(user) && user->query_temp("wizhood"))
                return 1;

	if (sscanf(file, "/u/" + euid + "/%*s"))
		return 1;

	path = explode(file, "/");

	// I will check all the path, why ? because the more deeply, the
        // more exactly
        valid = 0;
        i = sizeof(path);
        while ((i--) >= 0)
        {
		dir = "/";
                if (i >= 0) dir += implode(path[0..i], "/");

                arre = exclude_write[dir];
                arrt = trusted_write[dir];

		if (arre && member_array(euid, arre) != -1)
                {
                        valid = 0;
                        break;
                }

                if (arrt && member_array(euid, arrt) != -1)
                {
                        valid = 1;
                        break;
                }

		if (arre && member_array(status, arre) != -1)
                {
                        valid = 0;
                        break;
                }

                if (arrt && member_array(status, arrt) != -1)
                {
                        valid = 1;
                        break;
                }
	}

        if (valid) return 1;

	if (! func) func = "null";
	if (member_array(func, ({ "ls", "dest" })) != -1)
                return 0;

	log_file("files", sprintf("%s  %s%s write attempt(%s) on %s failed.\n",
		 log_time(), euid, wizhood(user), func, file));
	return 0;
}

// valid_read - called by the master object to determine whether if an user
//               is allowed to write on a certain file.
// NOTE:
//     The argument user should be an object according to the source code
// of driver. However, it is a mixed type in the released docs. We assume
// it is an object in normal case here and issue an error if it was not
// an object. 												- Annihilator
int valid_read(string file, mixed user, string func)
{
	string euid, status, *path, dir;
        string *arre, *arrt;
	int i;
        int valid;

	if (! objectp(user))
        {
                if (stringp(user))
                        euid = user;
                else
		        error("TRUST_D->valid_read: Invalid argument type of user.\n");
        } else
                euid = geteuid(user);

	// Let user save their save file
	if (func == "restore_object")
        {
		if (sscanf(base_name(user), "/clone/%*s") &&
		    sscanf(file, "/data/%*s") &&
		    (file == (string)user->query_save_file() +  __SAVE_EXTENSION__ ||
                     file == (string)user->query_save_file()))
			return 1;
	}

	if (func == "file_size") return 1;

	// Get the euid and status of the user.
	if (! euid) return 0;
	status = get_status(user);

	if (euid == ROOT_UID || status == "(admin)") return 1;

        if (objectp(user) && user->query_temp("wizhood"))
                return 1;

	if (sscanf(file, "/u/" + euid + "/%*s") ||
            file == "/u/" + euid)
		return 1;

        if (sscanf(file, "/log/user/%*s/" + euid))
                return 0;

        if (sscanf(file, "%*s/"))
	path = explode(file, "/");

	// I will check all the path, why ? because the more deeply, the
        // more exactly
        valid = 0;
        i = sizeof(path);
        while ((i--) >= 0)
        {
		dir = "/";
                if (i >= 0) dir += implode(path[0..i], "/");

                arre = exclude_read[dir];
                arrt = trusted_read[dir];

		if (arre && member_array(euid, arre) != -1)
                {
                        valid = 0;
                        break;
                }

                if (arrt && member_array(euid, arrt) != -1)
                {
                        valid = 1;
                        break;
                }

		if (arre && member_array(status, arre) != -1)
                {
                        valid = 0;
                        break;
                }

                if (arrt && member_array(status, arrt) != -1)
                {
                        valid = 1;
                        break;
                }
	}

        if (valid) return 1;

        // can not read this directory ?
        // I should test deeper directory if the user want to
        // ls or cd
        if ((func == "ls" || func == "cd") &&
            file_size(file) == -2)
        {
                file = "/" + implode(path, "/") + "/";
                if (file == "/u") return 1;
                foreach (dir in keys(trusted_read))
                {
                        if (! sscanf(dir, file + "%*s"))
                                continue;

                        if (! arrayp(arrt = trusted_read[dir]))
                                continue;

                        if (member_array(euid, arrt) != -1 ||
                            member_array(status, arrt) != -1)
                                return 1;
                }
        }

	if (! func) func = "null";
	if (member_array(func, ({ "ls", "clone" })) != -1)
                return 0;

	log_file("files", sprintf("%s  %s%s read attempt(%s) on %s failed.\n",
		 log_time(), euid, wizhood(user), func, file));
	return 0;
}

// can ob set euid?
int valid_seteuid(object ob, string uid)
{
	if (uid == 0) return 1;
	if (uid == getuid(ob)) return 1;
	if (getuid(ob) == ROOT_UID) return 1;
	if (sscanf(file_name(ob), "/adm/%*s")) return 1;
	if (wiz_status[uid] != "(admin)" &&
	    wiz_status[getuid(ob)] == "(admin)")
		return 1;
	return 0;
}

// can ob bind function ?
int valid_bind(object binder, object old_owner, object new_owner)
{
        // ROOT可以绑定任何函数
        if (geteuid(binder) == ROOT_UID) return 1;

        // 如果绑定者没有发生变化
        if (binder == new_owner) return 1;

        if (! wiz_level(new_owner) && geteuid(new_owner) != ROOT_UID)
                return 1;

        // 不同意绑定
        return 0;
}

// does the ob grant to use the command ?
int valid_grant(object ob, string min_level)
{
        object cmd_ob;
        string cmd;
        string *gr;
        object call_ob;

        if (! objectp(ob) || ! objectp(this_player(1)))
                return notify_fail("没有对象呼叫这个命令。\n");

        if (! objectp(cmd_ob = previous_object()))
                return notify_fail("必须是命令调用授权函数。\n");

        cmd = base_name(cmd_ob);
        if (sscanf(cmd, "/cmds/%*s/%s", cmd) != 2)
                return notify_fail("必须是命令调用授权函数。\n");

        // 如果不是ROOT对象或是玩家本人呼叫，则不能授权。
        call_ob = previous_object(1);
        if (! call_ob || call_ob != this_player(1) && geteuid(call_ob) != ROOT_UID)
        {
                log_file("static/security",
                         sprintf("%s want to call cmd:%s with %s\n",
                                 (call_ob ? geteuid(call_ob) : "null"),
                                 cmd,
                                 (this_player(1) ? geteuid(this_player(1)) : "null")));
                return 0;
        }

        // 是ROOT对象呼叫命令么？如果是，则可以授权。
        if (geteuid(ob) == ROOT_UID && call_ob == ob)
                return 1;

        if (ob != this_player(1))
                return notify_fail("不是本人呼叫这个命令。\n");

        // 是管理员呼叫命令么？如果是，则可以授权。
        if (is_root(ob))
                return 1;

        // 权限满足最低要求么？
        if (wiz_level(ob) >= wiz_level(min_level))
                return 1;

        // 是否有显式的授权？如果有，则可以授权。
        if (arrayp(gr = grant[geteuid(ob)]) && member_array(cmd, gr) != -1)
                return 1;

        return 0;
}

// 授权函数
int grant(string user, string cmd)
{
        string *gr;

        if (! previous_object() || ! is_root(previous_object()))
                return 0;

        if (! arrayp(gr = grant[user]))
                gr = ({ cmd });
        else
        if (member_array(cmd, gr) == -1)
                gr += ({ cmd });
        else
                return 0;

        grant[user] = gr;
        return 1;
}

// 收回授权
int remove_grant(string user, string cmd)
{
        string *gr;

        if (! previous_object() || ! is_root(previous_object()))
                return 0;

        if (cmd == "*")
        {
                if (undefinedp(grant[user]))
                        return 0;

                map_delete(grant, user);
                return 1;
        }

        if (! arrayp(gr = grant[user]) ||
            member_array(cmd, gr) == -1)
                return 1;

        gr -= ({ cmd });
        if (sizeof(gr) < 1)
                map_delete(grant, user);
        else
                grant[user] = gr;

        return 1;
}

// 查询授权
string *query_grant(string user)
{
        if (! previous_object() || ! is_root(previous_object()))
                return 0;

        return grant[user];
}

// 查询所有授权的人
string *query_grant_users()
{
        if (! previous_object() || ! is_root(previous_object()))
                return 0;

        return keys(grant);
}

// 站点特殊权限的信息
varargs int set_site_privilege(string item, string desc)
{
        if (! previous_object() || ! is_root(previous_object()))
                return 0;

        if (! stringp(item))
                return 0;

        if (! stringp(desc))
                map_delete(site_privilege, item);
        else
                site_privilege[item] = desc;

        return 1;
}

// 查询权限信息
varargs mixed query_site_privilege(string item)
{
        if (! stringp(item))
        {
                if (! previous_object() || ! is_root(previous_object()))
                        return 0;

                return site_privilege;
        }

        return site_privilege[item];
}

// 备份文件
void backup_file(string file)
{
        string euid;
        mixed lt;
        string* str;
        string bname;

        euid = geteuid(previous_object());
        if (euid == ROOT_UID || get_status(euid) == "(admin)")
                return;

        if (file_size(file) <= 0)
                return;

        if (! VERSION_D->is_release_server())
                return;

        lt = localtime(time());
        str = explode(file, "/");
        seq++;
        seq %= 10000;
        bname = sprintf("/log/file/%s/%d-%d-%d/%d-%s",
                        euid,
                        lt[LT_YEAR], lt[LT_MON] + 1, lt[LT_MDAY],
                        seq, str[sizeof(str) - 1]);
        assure_file(bname);
        cp(file, bname);
}
