mapping dict = ([

     "list":"交易",
      "buy":"购买",
    "fight":"切磋",
     "kill":"拼命"

]);

string dict(string str)
{
    if (dict[str])
    {
        return dict[str];
    }
    else
    {
        return str;
    }
}
