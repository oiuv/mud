inherit ROOM;

void create()
{
	set("short", "武馆后院");
	set("long", @LONG
这里是武馆的后院，龙腾武馆的馆主经常会在这里亲自向一些年轻有
为的弟子传授武功，得到他的指点你会受益匪浅。一个方方正正的大院子，
环境比较幽静，并不像外面那么喧哗，吵闹，是一个静心练武的好地方。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"north" : __DIR__"wuguan",
	]));

	setup();
	replace_program(ROOM);
}
