#include <room.h>
inherit ROOM;

void create()
{
      set("short", "武馆操练房");
      set("long", @LONG
这里摆满了石锁簸箕、大刀长剑、沙袋绑腿等，还有几个
精心制造的木人，是武馆弟子日常练功的地方。
LONG);

      set("exits", ([
          	"down" : __DIR__"wuguan",
      ]));

      set("objects", ([
          	"/clone/npc/tong-ren" : 1,
      ]));

      setup();
      replace_program(ROOM);
}
