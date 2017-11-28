inherit ROOM;

void create()
{
       set("short","芙蓉洞外");
       set("long",@LONG
只见此处有一个小洞，洞口狭小，只能容一人通过。洞中
却射出一缕阳光。
LONG);
       set("exits",([
              "enter":__DIR__"furong1",
       ]));
	
       setup();
       replace_program(ROOM);
}
