#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "大雄宝殿");
        set("long", @LONG
这是峨嵋山华藏庵的大雄宝殿。正中供奉着普贤菩萨。有
群青衣小师太正在地上诵经。后面有道小门通往后殿。后殿是
峨嵋派第三代掌门人灭绝师太传功的地方。
LONG);
        set("exits", ([
                "north" : __DIR__"hcaguangchang", 
                "south" : __DIR__"hcahoudian", 
        ]));
        set("objects", ([
                __DIR__"obj/xiang" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
}

void init()
{
        add_action("do_move", "move");
}

int do_move(string arg)
{
        object me = this_player();

        if (! arg || arg != "xiang")
                return notify_fail("你要移动什么？\n");

        if (query("exits/down"))
                return notify_fail("座像已经被移开了。\n");

        message_vision(HIC "\n$N" HIC "刚一推动" NOR + YEL "普贤菩萨像"
                       HIC "，那座像却自己向一方移开，地面现出一个洞口"
                       "。\n\n" NOR, me);
        set("exits/down", __DIR__"midao");
        remove_call_out("close");
        call_out("close", 8, this_object());

        return 1;
}

void close(object room)
{
        message("vision", WHT "忽然只听「喀喀喀」几声，" YEL "普贤菩萨像"
                          WHT "缩回原地，把密道挡住了。\n" NOR, room);
        room->delete("exits/down");
}
