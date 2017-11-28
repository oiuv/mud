// /clone/board/chatroom_b.c

inherit BULLETIN_BOARD;

void create()
{
	set_name("聊天室留言板", ({ "board" }));
	set("long", "大家都来灌灌水，一起说废话。\n" );
	set("capacity", 100);
        // not setup now
        // I will call setup after set from me
}

void set_from_me(object me, object chatroom)
{
        if (query("board_id"))
                return 0;

        if (! geteuid(me))
                return 0;

        set("board_id", "chatroom_" + geteuid(me));
        set_name(me->name(1) + "的留言板", ({ "board" }));
	set("capacity", 100 + (int)me->query_skill("idle-force", 1));
        setup();
        move(chatroom);
}

int do_discard(string arg)
{
	mapping *notes;
	int num;

	if (! arg || sscanf(arg, "%d", num) != 1)
		return notify_fail("指令格式：discard <留言编号>\n");
	notes = query("notes");
	if (! arrayp(notes) || num < 1 || num > sizeof(notes))
		return notify_fail("没有这张留言。\n");
	num--;
	if (notes[num]["author"] != (string) this_player(1)->query("name") + "-" +
                                    this_player(1)->query("id")
        &&      ! environment()->is_owner(this_player(1))
	&&	(string)SECURITY_D->get_status(this_player(1)) != "(admin)"
	&&      (string)SECURITY_D->get_status(this_player(1)) != "(arch)")
        {
		write("这个留言不是你写的，你也不是这个聊天室的老大。\n");
                return 1;
        }

	notes = notes[0..num - 1] + notes[num + 1..sizeof(notes) - 1];
	set("notes", notes);
	save();
	write("删除第 " + (num+1) + " 号留言....Ok。\n");
	return 1;
}
