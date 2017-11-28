inherit ROOM;

void create()
{
        set("short", "扬刀立威会场");
        set("long", @LONG
这里是扬刀立威会场，一片青草地上摆着七八张方桌，除
了东首第一席外，每张桌旁都已坐了人，有海沙派、巨鲸帮及
神拳门等等各派弟子。
LONG);
        set("skybook", 1);
        set("no_sleep_room", 1);
        set("exits", ([
                "west" : __DIR__"gukou",
        ]));
        set("objects", ([
                __DIR__"npc/mai" : 1,
                __DIR__"npc/guo" : 1,
                __DIR__"npc/yin" : 1,
                __DIR__"npc/yuan" : 1,
                __DIR__"obj/ding" : 1,
                __DIR__"npc/zhang" : 1,
                __DIR__"npc/chang" : 1,
        ]));
        setup();
}
