#include <ansi.h>

inherit __DIR__"underlt";

void create()
{
	set("short", "武道场");
	set("long", @LONG
这里是三面环山，只有北面有条出口的一坪山间平地。山
坡山阵阵松涛哗哗作响，山脚下的平地绿草如茵，中间架起了
个擂台，四周一溜过去搭着凉棚，棚中桌椅杯盆俱全。
LONG);
        set("outdoors", "city");
	set("exits", ([
		"leitai"      : __DIR__"leitai",
		"north"       : __DIR__"ximenroad",
		"southeast"   : __DIR__"wudao1",
		"southwest"   : __DIR__"wudao2",
	]));
	set("no_fight", 1);
	setup();
	// "/clone/board/wudao_b"->foo();
    init_here();
	replace_program(__DIR__"underlt");
}
