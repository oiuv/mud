inherit ROOM;

void create()
{
      	set("short", "九老洞口");
      	set("long", @LONG
九老洞在仙峰寺外。传说远古时候，有九位仙叟住在这个
洞里，不知他们生于何年，终于何年。轩辕皇帝访道于此，见
一老叟，问曰：有侣乎？答曰：九人。这是九老洞的来历。这
个洞很深，很少有人进去，只有些人站在洞口谈笑呼叫。这里
向西经九十九道拐到千佛庵，一路向北到莲花石。
LONG);
      	set("objects", ([
           	"/clone/quarry/hou" : 2,
      	]));
      	set("outdoors", "emei");
      	set("exits", ([
          	"east"      : __DIR__"jsjdg4",
          	"enter"     : __DIR__"jiulaodong",
          	"northwest" : __DIR__"lianhuashi",
      	]));
      	setup();
        replace_program(ROOM);
}
