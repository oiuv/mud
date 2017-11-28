// shufang.c

inherit ROOM;

string* books = ({
        "/clone/book/book-bamboo",
        "/clone/book/book-silk",
        "/clone/book/book-stone",
        "/clone/book/book-iron",
});

void create()
{
        set("short", "书房");
        set("long", @LONG
这里是书房，靠墙是一排书架，摆满了当今武林各个门派的武功
密藉。石洞中间放着石桌和几个石凳，侠客岛龙木二岛主常常在这里
读书。
LONG );
        set("exits", ([
                "west" : __DIR__"dating"
        ]));
        set("objects", ([
                books[random(sizeof(books))] : 1,
        ]));
        setup();
        replace_program(ROOM);
}
