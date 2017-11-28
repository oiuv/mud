inherit NPC;

void destroying(object, object);

void create()
{
        set_name("丁典", ({ "ding dian", "ding" }));
        set("long", 
                "这人满脸虬髯，头发长长的直垂至颈，衣衫破烂不堪，简直如同荒山中的野人。\n");
        set("gender", "男性");
        set("age", 35);

        set_skill("unarmed", 120);
        set_skill("dodge", 100);
        set_skill("parry", 100);
        set_skill("feiyan-zoubi", 120);
        set_skill("shenzhaojing", 120);
        map_skill("force","shenzhaojing");
        map_skill("dodge","feiyan-zoubi");
        map_skill("unarmed","shenzhaojing");
        prepare_skill("unarmed","shenzhaojing");
        set("max_neili",2000);
        set("neili",2000);
        set("jiali",100);

        set("combat_exp", 600000);
        set("shen_type", 1);
        setup();
        carry_object("/clone/cloth/cloth")->wear();

}

int accept_object(object me, object obj)
{
        object key;
        if ((string)obj->query("id")=="lv juhua") {
                message("vision",me->name()+"给丁典一盆绿菊花。\n",environment(me),
            ({me}));
        key = new("/clone/book/shenzhaojing");
        if (!key){
         command("say 我已经托人把书带给霜华了，不劳您大驾了。");
        return 0;
        }
        
        command("touch "+me->query("id"));
        command("say 这位"+RANK_D->query_respect(me)+"是霜华派来送信的吧。");
        key->move(me);
        add("book_count", -1);
        message_vision("$n递给$N一本书。\n", me, this_object() );
        command("say 这本书就是我练功打坐用的《神照经》，你拿去带给霜华吧。");
        command ("rumor "+me->query("name")+"弄到了一册神照经。");
        remove_call_out("destroying");
        call_out("destroying", 1, this_object(), obj);
        return 1;
        }
        return 0;
}

void destroying(object me,object obj)
{
        destruct(obj);
        return;
}

