// tian.c  田嫂

inherit NPC;

void create()
{
        set_name("田嫂", ({"tian sao","tian","sao"}));
        set("title", "女易牙");
        set("gender", "女性" );
        set("age", 36);
        set("long", "一个白皙丰满的中年妇人。\n");
        set("combat_exp", 2000);
        set("attitude", "friendly");
        setup();
        carry_object("/d/city/obj/cloth")->wear();

}
void init()
{
::init();
        add_action("do_yao", "yao");
}

int do_yao(string arg)
{
        object m,mm;
        message_vision("$N向田嫂问道：大嫂，开饭了吗？\n", this_player());

        if((int)this_player()->query("food") >=
           (int)this_player()->max_food_capacity()*90/100 )
                return notify_fail("田嫂笑道：没那，等开饭时再来吧！\n");

        if((present("baozi", this_player())))
        return notify_fail("田嫂笑道：不要拿着手里的，还看着锅里的！\n");
        
        if ( present("baozi", environment()) )
                return notify_fail("田嫂笑道：那不是有一块呢嘛，吃完再说！\n");

        m=new(__DIR__"obj/baozi2");
        mm=new(__DIR__"obj/baozi2");


        m->move(this_player());
        mm->move(this_player());

        message_vision("田嫂对$N笑道：饿了吧，慢点吃。\n", this_player());
                return 1;
}

