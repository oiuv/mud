#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "水帘洞外洞");
        set("long", @LONG
这里就是水莲洞外洞，只见洞内怪石突现，洞高丈许，甚
是开阔，身后便是瀑布(pubu)，随飞瀑而下的细小水末洒在脸
上，令人顿感凉爽之极，不断有水滴顺着洞内的怪石滴下，连
成一条条细线,远观之下犹如一幅幅窗帘， 水莲洞也因此得名。
LONG);
	set("item_desc",([
	       "pubu":HIC"\n你仰望瀑布，景致甚为壮观，可是你猛然发现外面"
                      "的平地却在水莲洞上方，要跳出去却是万难做到。\n\n"NOR,
	]));

	set("exits",([
	       "enter":__DIR__"inhole1",
	]));	
	     	
       setup();
       replace_program(ROOM);
}

