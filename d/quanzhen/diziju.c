#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "弟子居");
        set("long", @LONG
这里是全真弟子居住的房间。房间很大，整齐地铺着一排
排的床，床上被褥都折叠得很整齐，但连个人都没有，也许所
有的弟子都去练功去了。靠墙的地方有个柜子(cabinet)。
LONG);
        set("sleep_room",1);
        set("exits", ([
                "north" : __DIR__"jingxiushi",
        ]));
        set("item_desc", ([
                "cabinet": RED "这是一个红木角柜，也许"
                           "是堆放衣物用的。\n" NOR
        ]));
        set("no_clean_up", 0);
        setup();
}

void init()
{
        add_action("do_pull","pull");
}

int do_pull(string arg)
{
        object me = this_player();

        if (! arg || arg != "cabinet")
                return notify_fail("你要拉开什么？\n");

        message_vision(HIY "\n$N" HIY "使劲把柜子拉开，现出一个洞口。"
                       "原来这里是密室的入口。\n\n" NOR, me);
        set("exits/down", __DIR__"mishi");
        remove_call_out("close");
        call_out("close", 8, this_object());

        return 1;
}

void close(object room)
{
        message("vision", WHT "柜子又吱吱地回到原地，把入口挡住了。\n"
                          NOR, room);
        room->delete("exits/down");
}
