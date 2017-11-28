inherit ROOM;

void create()
{
        set("short", "山崖");
        set("long", @LONG
此处入云高耸，已是黑木崖上，两旁站满了日月神教的弟
子。两旁的刻着两行大字，右首是「文成武德」，左首是「仁
义英明」，横额上刻着「日月光明」四个大红字。
LONG);
        set("outdoors", "heimuya");
        set("exits", ([
            "south" : __DIR__"shanya3",
            "north" : __DIR__"shanya1",
        ]));
        set("objects", ([
                __DIR__"npc/dizi2" : 4,
        ]));
        setup();
        replace_program(ROOM);
}
