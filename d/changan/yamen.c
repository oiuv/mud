//Room: yamen.c

inherit ROOM;

void create ()
{
        set ("short", "衙门大门");
        set ("long", @LONG
这是长安城的衙门大门，也是长安城最高的行政机构，这里负责管
理城里的大事小情。无论是偷鸡摸狗的小贼，还是放火杀人的强盗，都
会在这里受到应有的处罚。墙上贴着一张告示。
LONG);
        /*
        set("item_desc", ([
        	"gaoshi": ""
        ]) );
        */
        set("exits", 
        ([ //sizeof() == 2
        	"south" : __DIR__"yamen-datang",
        	"north" : __DIR__"qinglong3",
        ]));
        set("objects", 
        ([ //sizeof() == 1
        	__DIR__"npc/yayi" : 4,
        ]));

        setup();
        replace_program(ROOM);
}
