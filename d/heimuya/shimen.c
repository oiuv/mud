inherit ROOM;

void create()
{
        set("short", "石门");
        set("long", @LONG
得到一道大石门前，只见两旁刻着两行大字，右首是「文
成武德」，左首是「仁义英明」，横额上刻着「日月光明」四
个大红字。
LONG);
        set("outdoors", "heimuya");
        set("exits", ([
            	"eastdown" : __DIR__"shijie2",
            	"westup"   : __DIR__"up1",
        ]));
        set("objects", ([
                CLASS_D("riyue") + "/zhao" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
