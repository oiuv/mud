inherit ROOM;

void create()
{
    	set("short", "甬道");
    	set("long", @LONG
这里玉室下密道的一道梯级。下了梯级再走十多丈路，前
面豁然开朗，竟是一大片平地。
LONG);
    	set("exits", ([ 
  		"down" : __DIR__"feicui1",
  		"out" : __DIR__"yushi",
	]));
    	setup();
    	replace_program(ROOM);
}
