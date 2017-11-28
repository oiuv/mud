//ziweitang.c
inherit ROOM;

void create()
{
        set("short", "紫微堂");
        set("long", @LONG
这里就是明教的紫微堂，堂上的大匾上 "紫微贯日" 四字并不因
堂主殷素素早逝而有丝毫减色。堂中陈设一如往昔。
LONG );
        set("exits", ([
            "east"      : __DIR__"tianweitang",
        ]));
        set("objects",([
             __DIR__"npc/yinwushou":1,
        ]));
        setup();
        replace_program(ROOM);
}
