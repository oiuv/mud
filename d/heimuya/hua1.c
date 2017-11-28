inherit ROOM;

void create()
{
        set("short", "花园");
        set("long", @LONG
这里是风雷堂内的一个极精致的小花园。只见花园中红梅
绿竹，青松翠柏，布置得颇具匠心，往西去是一片青草地。
LONG);
        set("exits", ([
            	"west" : __DIR__"grass2",
        ]));

        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
