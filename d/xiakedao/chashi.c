// Room: /d/xiakedao/chashi.c

#include <ansi.h>

inherit ROOM;

void init();
int do_sit(string);

void delete_served(object);

void create()
{
        set("short", "茶室");
        set("long", @LONG
这是一个石洞，三枝红烛照耀得全洞明亮。洞内坐满了人，一个
童子忙前忙后，满屋的果香和茶香，沁人心脾。屋里四周得体地摆着
些桌子(table)和椅子(chair)。
LONG );

        set("no_fight", 1);
        set("exits", ([
                "east" : __DIR__"neiting",
        ]));

        set("item_desc", ([
            "table" : "一张精致的木制小桌，上面放着一些茶具。\n",
            "chair" : "一只青竹打制的靠椅，躺上去摇摇晃晃，好舒服耶！\n",
        ]));

        set("objects",([
                __DIR__"npc/tongzi" : 1,
                "/d/wudang/obj/mitao" : 4,
                "/d/wudang/obj/xiangcha" : 1,
        ]));
        setup();
}

void init()
{
        add_action("do_sit", "sit");
}

int do_sit(string arg)
{
        if (! arg || (arg != "chair"))
                return notify_fail("你要坐什么上面？\n");

        if (this_player()->query_temp("marks/sit"))
                return notify_fail("你已经有了个座位了。\n");

        this_player()->set_temp("marks/sit", 1);
        return notify_fail("你找了个空位座下，等着上茶。\n");
}

int valid_leave(object me, string dir)
{

        if ((dir == "east")
           && (present("xiang cha", this_player()) ||
               present("mi tao", this_player()))
           && objectp(present("tongzi", environment(me))))
        {
                switch (random(2))
                {
                case 0:
                        return notify_fail("童子把嘴一撇：吃饱了喝足了"
                                           "还不够，临走怀里还揣上一些！\n");
                case 1:
                        message_vision("童子对$N鞠了个躬：岛主吩咐，饮食不得带出茶房。", me);
                        return -1;
                }
        }

        me->delete_temp("marks/sit");
        me->delete_temp("tea_cup");
        return ::valid_leave(me, dir);
}
