inherit ROOM;

void create()
{
        set("short", "山道");
        set("long", @LONG
这一路上山，地势极险，脚下是万丈深谷，而山道极之陡
峭窄小，倘若一不留神，必将命丧于此。
LONG);
        set("outdoors", "heimuya");
        set("exits", ([
            	"eastdown" : __DIR__"shandao1",
            	"westup"   : __DIR__"shijie1",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
