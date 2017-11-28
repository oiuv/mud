
inherit ROOM;

void create()
{
        set("short", "小河边");
        set("long", @LONG
此处位於终南山角一偏僻处，浓荫匝地，花光浮动，周围
尽是叁天古木，颇具幽静之美。不远处的小河由山洞(dong)中
涌出的泉水所形成，淙淙的水声更让你觉得身心顺畅。往北可
通往山林深处。往西可进入山洞中。
LONG
        );
        set("outdoors", "quanzhen");
        set("item_desc", ([
                "dong" : "一个深邃、幽暗、恐怖的小山洞。\n",
        ]));
        set("exits", ([
                "enter" : __DIR__"shandong",
                "north" : __DIR__"shanlu16",
        ]));

        setup();
        replace_program(ROOM);
}
