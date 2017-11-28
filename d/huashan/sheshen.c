inherit ROOM;

void create()
{
        set("short", "舍身崖");
        set("long", @LONG
这是一段极窄极险的山崖，四周云雾飞绕，下面渊深无底。
如不小心，一失足掉下去，只怕连骨头都找不到。
LONG);
        set("exits", ([
            	"eastdown" : __DIR__"canglong",
        ]));
        setup();
        replace_program(ROOM);
}
