// purge.c

#include <ansi.h>

#define SYNTAX	"指令格式：purge <使用者姓名> because <原因>\n"

inherit F_CLEAN_UP;

private int do_purge_players(int day);

int main(object me, string arg)
{
	string name, reason;
//	int day;
        object ob;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

	if (! arg)
                return notify_fail(SYNTAX);

	if (sscanf(arg, "%s because %s", name, reason) != 2)
		return notify_fail(SYNTAX);

        if (wiz_level(me) <= wiz_level(name) && ! is_root(me))
                return notify_fail("你没有权限删除这个人物。\n");

	seteuid(getuid());
	if (file_size(DATA_DIR + "login/" + name[0..0] + "/" + name + __SAVE_EXTENSION__) < 0)
		return notify_fail("没有这位使用者。\n");

        if (ob = find_player(name))
                CHANNEL_D->do_channel(this_object(), "rumor", "使用者" +
                                      ob->query("name") + "被" +
                                      me->query("name") + "删除了。");

        // remove the user from disk
        UPDATE_D->remove_user(name);

	tell_object(me, "使用者 " + capitalize(name) + " 删除掉了。\n");
	log_file("static/purge", sprintf("%s %s purged %s because %s.\n",
		 log_time(), geteuid(this_player(1)), name, reason));

	return 1;
}

int help(object me)
{
write(@HELP
指令格式：purge <使用者姓名> because <原因>

清除一个使用者或清除超过一定天数不曾上线地使用者。
HELP );
    return 1;
}