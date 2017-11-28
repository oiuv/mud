inherit ROOM;

void create()
{
        set("short", "药房");
        set("long", @LONG
这是间药房，靠墙放着只大药柜。屋子里有张桌子，上边
摆满了炼药用的瓶瓶罐罐。炼药师是位小姑娘，正在那里发呆
不知在想什么。北面是气派的长廊。
LONG);
        set("exits", ([
                "north" : __DIR__"changlang",
        ]));
        set("objects", ([
                __DIR__"npc/xiaoqing" : 1,
        ]));

        setup();
        replace_program(ROOM);
}
