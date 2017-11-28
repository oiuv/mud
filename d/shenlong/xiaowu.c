#include <ansi.h>

inherit ROOM;
string* books = ({
	"/clone/book/book-bamboo",
	"/clone/book/book-paper",
	"/clone/book/book-stone",
	"/clone/book/book-iron",
});


void create()
{
    set("short", "小屋");
    set("long", @LONG
一进小屋，只见墙上挂满了无数名贵的字画，书架上也堆满了平
时难得一见的各种各样的书籍。一个相貌英武的中年文士正对着一幅
字画唉声叹气。
LONG
    );

    set("exits", ([
	"south" : __DIR__"caodi",

    ]));
    set("objects", ([
		CLASS_D("shenlong")+"/lu": 1,
		books[random(sizeof(books))] : 1,
		books[random(sizeof(books))] : 1,
    ]));
    set("outdoors", "shenlong");
    setup();
   replace_program(ROOM); 
}


