// info.c

inherit F_CLEAN_UP;

int help(object me);

int main(object me, string arg)
{
	object obj;
	string str;
        int ttl;
        string ext;

        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return 0;

	if (! arg) return help(me);

	seteuid(geteuid(me));

	if (arg == "me") obj = me;
	else if (arg == "my link") obj = me->query_temp("link_ob");
	else
        {
		obj = present(arg, me);
		if (! obj || ! me->visible(obj)) obj = present(arg, environment(me));
		if (! obj || ! me->visible(obj)) obj = find_player(arg);
		if (! obj || ! me->visible(obj)) obj = find_living(arg);
		if (! obj) obj = find_object(resolve_path(me->query("cwd"), arg));
		if (! obj) return notify_fail("没有这样物件....。\n");
	}

	write(sprintf("物件 [%O]\n-----------------------------------------------------\n", obj));
	write("档案：\t\t" + base_name(obj) + ".c\n");
	write("领域：\t\t" + domain_file(base_name(obj)) + "\n");
	write("作者：\t\t" + author_file(base_name(obj)) + "\n");
	write("权限：\t\tuid = " + getuid(obj) + ", euid = " + geteuid(obj) + "\n");
	write("等级：\t\t" + wizhood(obj) + "\n");
	write("使用记忆体：\t" + memory_info(obj) + "\n");
	str = "";
	if (living(obj)) 	str += "生物 ";
	if (userp(obj))		str += "使用者 ";
	if (interactive(obj))	str += "线上 ";
	if (wizardp(obj))	str += "巫师 ";
	if (clonep(obj)) 	str += "复制 ";
	if (virtualp(obj)) 	str += "虚拟 ";
        if (obj->query("env/invisible")) str += "隐身 ";
	if (query_heart_beat(obj)) str += "心跳:" + query_heart_beat(obj) + " ";
	write("属性：\t\t" + str + "\n");

        if ((ttl = obj->query_time_to_leave()) > 0)
                write("禁闭：\t\t" + appromix_time(ttl) + "\n");

	write("复制个数：\t" + sizeof(children(base_name(obj)+".c")) + "\n");
	write("参考连结：\t" + refs(obj) + "\n");
        if (obj->is_telneting())
                write("远程登陆：\t" + obj->query_dest_addr() + "\n");

        if (stringp(ext = obj->query_info()))
                write(ext);

	return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : info <物件之名称或档名>

利用此一指令可得知一些有关该物件的资讯。
HELP );
        return 1;
}
