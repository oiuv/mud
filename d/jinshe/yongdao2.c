// yongdao2.c
#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "甬道");
        set("long", @LONG
甬道忽然转弯，走了两三丈远，前面豁然空阔，出现一个洞穴，
便如是座石室。可惜现在被大石头(stone)堵住了前方。
LONG );
        set("exits", ([ /* sizeof() == 2 */
            //"north" : __DIR__"shandong",
            "west"  : __DIR__"yongdao1",
        ]));
        set("item_desc", ([
            "stone" : "一块巨石，要想前进只有想办法把它移开（move）。\n"
        ]) );
        set("no_clean_up", 0);
        setup();
		//replace_program(ROOM);
}

void init()
{
        add_action("do_move", "move");
}

int do_move(string arg)
{
        object me=this_player();

        if( !arg || arg != "stone" ) {
                return notify_fail("你要移动什么？\n");
        }
        if (me->query("neili") < 1500 ||
            me->query_str() < 35)
        {
                message_vision("$N使出吃奶的劲也没能移动巨石。\n", me);
                me->set("neili", 0);
                return 1;
        }
        message_vision(HIC "$N" HIC "站在石前，双掌发力推动巨石，只听得巨石"
                       "吱吱连声，缓缓\n向后移去，现出一个山洞来。\n" NOR, 
                       this_player());
        set("exits/north", __DIR__"shandong");
        remove_call_out("close");
        call_out("close", 5, this_object());
        me->add("neili",-1000);
        return 1;
}

void close(object room)
{
        message("vision", HIW "\n只见巨石又吱吱地回到原地。\n" NOR, room);
        room->delete("exits/north");
}