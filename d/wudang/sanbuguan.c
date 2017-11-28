inherit ROOM;

void create()
{
        set("short", "三不管");
        set("long", @LONG
这里是四川、湖北与陕西的交界，俗称三不管。小土路的
两旁有疏疏落落的农舍耕田，几只牛羊正在吃草。路上行人很
少，都匆匆赶路。
LONG);
        set("outdoors", "wudang");
        set("exits", ([
                "east"      : __DIR__"wdroad8",
                "southeast" : __DIR__"wdroad9",
                "southwest" : "/d/emei/wdroad",
        ]));
        setup();
        replace_program(ROOM);
}

