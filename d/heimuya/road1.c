inherit ROOM;

void create()
{
        set("short", "乱石坡");
        set("long", @LONG
这是一处乱石怪异的小山岗，向东北是通往平安州的小路。
据说前方经常有野兽出没，不可久留。
LONG );
        set("outdoors", "heimuya");
        set("exits", ([
            	"north" : __DIR__"road2",
            	"south" : __DIR__"road4",
            	"west"  : __DIR__"linjxd1",
            	"east"  : __DIR__"tianroad1",
        ]));
        set("objects", ([
           	__DIR__"npc/laozhe" : 1 ,
        ]));
        setup();
        replace_program(ROOM);
}
