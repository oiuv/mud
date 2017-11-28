inherit ROOM;

void create()
{
        set("short", "成德殿大门");
        set("long", @LONG
此处入云高耸，已是黑木崖上，两旁站满了日月神教的弟
子。两旁的刻着两行大字，右首是「文成武德」，左首是「仁
义英明」，横额上刻着「日月光明」四个大红字。
LONG);
        set("outdoors", "heimuya");
        set("exits", ([
            	"south" : __DIR__"shanya2",
            	"north" : __DIR__"chengdedian",
        ]));
        set("objects", ([
                __DIR__"npc/dizi" : 2,
                CLASS_D("riyue") + "/wang" : 1,
        ]));
        setup();
}

int valid_leave(object me, string dir)
{
        object wang;

        if (dir != "north"
           || ! objectp(wang = present("wang cheng", this_object())))
                return ::valid_leave(me, dir);

        return wang->permit_pass(me, dir);
}
