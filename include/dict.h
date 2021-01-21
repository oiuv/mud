mapping dict = ([

       "list":"交易",
        "buy":"购买",
      "fight":"切磋",
       "kill":"拼命",
       "drop":"丢弃",
        "get":"拾取",
      "wield":"装备",
    "unwield":"解除",
       "wear":"穿戴",
     "remove":"脱下",

]);

string dict(string str)
{
    if (stringp(dict[str]))
    {
        return dict[str];
    }
    else
    {
        return str;
    }
}
