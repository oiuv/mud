#include <room.h>
inherit ROOM;

void create()
{
      	set("short", "南间操练房");
      	set("long", @LONG
这里摆满了大刀长剑、沙袋绑腿等，是武当弟子日常练功
的地方。
LONG);

      	set("exits", ([
            	"north"   : __DIR__"caolianfang",
      	]));
      	set("for_family", "武当派");
      	setup();
      	replace_program(ROOM);
}
