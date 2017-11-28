inherit ROOM;

void create()
{
        set("short", "内城西门");
        set("long", @LONG
洛阳内城西门高三丈，宽约二丈有余，尺许厚的城门上镶满了拳头般
大小的柳钉。门洞长约四丈，大约每隔两个时辰就换官兵把守。洞侧帖满
了悬赏捉拿之类的官府通谍，一条笔直的青石板大道向东西两边延伸，东
去就是洛阳内城了，向西一桥高高跨过洛阳城护城河。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
                "east" : __DIR__"wroad7",
                "west" : __DIR__"wbridge",
        ]));
        set("objects", ([
                "/d/kaifeng/npc/guanbing" : 4,
                "/d/beijing/npc/ducha" : 1,
                "/clone/npc/walker" : 1,
        ]));
        setup();
        replace_program(ROOM);
}

