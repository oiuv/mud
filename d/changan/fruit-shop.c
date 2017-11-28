//Room: fruit-shop.c

inherit ROOM;

void create ()
{
        set ("short", "水果店");
        set ("long", @LONG
长安城唯一的一家水果店。店里面摆满了一排排的竹筐，筐里有各
式各样的水果。这儿的水果为了保持新鲜，都是每天从城外的果园用快
车运来的。水果店女老板张兰香正热情的招呼着客人。
LONG);
        set("exits", ([
        	"north"   : __DIR__"qixiang2",
        ]));
        set("objects", ([
        	__DIR__"npc/lanxiang"   : 1,
        ]));

        setup();
        replace_program(ROOM);
}
