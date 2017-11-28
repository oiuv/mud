// shufang.c 盘龙居书房

#include <ansi.h>

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "书房");
	set("long", @LONG
这里是盘龙居的主人读书写字的地方，干净明亮。文房四宝整整齐齐
的摆在桌子上面。有时主人也在这里签发一些邀请客人的请柬。
LONG );

	set("default_long", "这里是ROOM_NAME的主人ROOM_OWNER读书写字的"/* EXAMPLE */
                            "地方，干净明亮。文房四宝整整齐齐的摆在桌" /* EXAMPLE */
                            "子上面。有时ROOM_OWNER也在这里签发(sign"/* EXAMPLE */
                            ")一些邀请客人的请柬。");                  /* EXAMPLE */
                                                                       /* EXAMPLE */

	set("exits", ([
		"east" : __DIR__"jusuo",
	]));

        set("sleep_room", 1);
        setup();

//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_owner_id", "ROOM_OWNER_ID");
//**    set("room_position", "ROOM_POSITION");
}

void init()
{
//**    add_action("do_sign", "sign");
}

int do_sign()
{
        object ob;
        object me;

        me = this_player();

//**        if (! is_room_owner(me))
//**                return notify_fail("你又不是这儿的主人，乱搞"
//**                                   "什么？\n");

        if (me->is_busy())
                return notify_fail("你现在还忙着呢。\n");

        message_vision("$N抽过一张纸，拿起笔来，在上面画符似"
                       "的写了些东西。\n", me);
        tell_object(me, "你写好一份手谕。\n");

        ob = new("/d/room/roomobj/pass");
        ob->set_name(HIW + me->query("name") + "手谕" NOR,
                     ({ "pass", query("room_owner_id") + " pass" }));
        ob->set("long", "一张由" + me->query("name") + "亲笔签发的" +
                     "手谕，凭借它你可以进出" + query("room_name") +
                     "。\n");
        ob->move(me);
        me->start_busy(4 + random(4));
        return 1;
}
