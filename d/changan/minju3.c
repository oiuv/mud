//Room: minju3.c

inherit ROOM;

void create ()
{
        set ("short", "民居");
        set ("long", @LONG
这所房子看起来好像已经很久没人住了。雕花漆彩的门窗已是破败
不堪，满目蛛丝鼠粪，墙上地下到处都是灰尘，一只老鼠跑来跑去。院
子里杂草丛生，宅外墙满是青苔蜘网，显得既荒凉又阴森。四周死一般
的沉寂。
LONG);
        set("exits", 
        ([ //sizeof() == 1
        	"north" : __DIR__"huarui3",
        ]));

        setup();
        replace_program(ROOM);
}
