inherit ROOM;

void create()
{
        set("short", "大道");
        set("long", @LONG
这是一条宽阔笔直的官道，足可容得下十马并驰。往东通
向脂粉之都的扬州，折向西南则通往西南重镇荆洲。
LONG);
        set("exits", ([
                "northeast" : "/d/city/ximenroad",
                "southwest" : __DIR__"road2",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "city");

        setup();
        replace_program(ROOM);
}

