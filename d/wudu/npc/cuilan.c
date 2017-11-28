// cuihua.c

inherit NPC;

void create()
{
        set_name("翠兰",({ "cui lan", "lan" }) );
        set("gender", "女性" );
        set("age", 18);
        set("long", "这是个普普通通的农家少女，看见生人羞的低下了头。\n");

        set("shen_type", 1);
        set("str", 15);
        set("dex", 18);
        set("con", 15);
        set("int", 17);
        set("combat_exp", 200);
        set_temp("apply/attack", 5);
        set_temp("apply/defense", 10);
        set("attitude", "peaceful");
        set("chat_chance",10);
        set("chat_msg",({
        "翠兰自言自语道：爹爹怎么还不回来啊，饭都要凉了。\n",
        }));

        setup();
        carry_object("/d/city/obj/cloth")->wear();
        add_money("coin", 150);
        set("inquiry", ([
                "爹爹": "我爹爹上五毒山采药去了，着么晚了，也该回家了。\n",
                "五毒山": "五毒山就在村子的东南边，不过进山要通过桃花峪，除了我爹爹，别人不敢去的。\n",
                "桃花峪": "想进桃花峪啊，那里终年都有瘴气弥漫，除非你也有诸葛行军散。\n",
                "诸葛行军散": "全村就我爹爹有这个东西，据说是跟一个叫诸葛什么的要的。\n",
        ]) );
}
