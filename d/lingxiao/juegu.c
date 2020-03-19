inherit ROOM;

void create()
{
        set("short","绝谷");
        set("long",@LONG
还好，你运气好，从万丈深渊上摔下来，居然摔到厚厚的
雪堆上，不但没断腿少胳膊，连皮都没伤到一点。但是，到了
这绝谷之下，如何上去倒是一大难题。
LONG);
        set("outdoors", "lingxiao");
        set("no_clean_up", 0);
        setup();
} 

void init()
{
    add_action("do_pan", "climb");
}

int do_pan()
{
        object me = this_player();
    	me->move(__DIR__"shiya");
    	return 1;
}

