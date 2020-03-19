inherit ROOM; 
string* books = ({
        __DIR__"obj/book-bamboo",
        __DIR__"obj/book-silk",
        __DIR__"obj/book-stone",
        __DIR__"obj/book-iron",
});

void create()
{
        set("short","书房");
        set("long",@LONG
这里是白自在的书房，一室之内，放满了各类书籍。白自在
虽然狂妄自大，但说到他学问，却当真也是饱读诗书，学富五车。
这里的书架，大大小小，总有十几个吧。白自在的书童正在这为
他整理。
LONG);
        set("exits",([
            "north"  : __DIR__"weideju",
            "south"  : __DIR__"bridge",
        ]));
        set("objects", ([  
                __DIR__"npc/su" : 1,
                books[random(sizeof(books))] : 1,
                books[random(sizeof(books))] : 1,
        ]));
        setup(); 
        replace_program(ROOM);
}

