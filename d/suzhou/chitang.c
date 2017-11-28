inherit ROOM;

void create()
{
        set("short", "池塘");
        set("long", @LONG
一池池水映入你的眼帘，小蓬莱翼然水中，曲折的石桥上
架着紫藤花棚。池东你可以看到曲溪楼、西楼、清风池等小筑，
掩映于花木山石之间。池西的山腰间，桂树丛生。秋日，置身
于“闻木樨香轩”，阵阵桂香，沁人心脾。轩下，水涧两岸叠
石重重，你不禁为此景而赞叹不已。
LONG );
        set("outdoors", "suzhou");
        set("exits", ([
                "north" : __DIR__"gumujiaohe",
        ]));
        set("max_room", 1);
        set("objects", ([
                __DIR__"npc/lady1" : 1,
        ]));
        setup();
}
