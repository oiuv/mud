inherit ROOM;

void create()
{
        set("short", "天香堂");
        set("long", @LONG
这是日月神教下第四大堂天香堂的大厅，大厅内非常的宽
畅明亮。远远望去郁郁渺渺，好似不食人间烟火。
LONG);
        set("exits", ([
                "north" : __DIR__"tiangate",
                "south" : __DIR__"tian1",
        ]));
        set("objects", ([
                "/d/shaolin/npc/shang1" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
