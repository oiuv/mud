inherit ROOM;
void create()
{
        set("short", "扬刀立威会场");
        set("long", @LONG
这里是扬刀立威会场，一片青草地上摆着七八张方桌，除了东首第一席外，
每张桌旁都已坐了人，有海沙派、巨鲸帮、神拳门等等各派弟子。
LONG );

        set("exits", ([
                "west" : "/d/tulong/tulong/gukou",
                ]));

        set("objects", ([
                "/d/tulong/tulong/npc/mai" : 1,
                "/d/tulong/tulong/npc/guo" : 1,
                "/d/tulong/tulong/npc/yin" : 1,
                "/d/tulong/tulong/npc/yuan" : 1,
                "/d/tulong/tulong/obj/ding" : 1,
                "/d/tulong/tulong/npc/zhang" : 1,
                "/d/tulong/tulong/npc/chang" : 1,
                ]));
setup();
}

